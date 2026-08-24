#!/usr/bin/env swift
import AVFoundation
import AudioToolbox
import Foundation

enum PreparationError: Error, CustomStringConvertible {
  case invalidArguments
  case invalidDuration
  case missingInput
  case unreadableAudio
  case unsupportedPCMFormat

  var description: String {
    switch self {
    case .invalidArguments:
      return "Usage: prepare-adhan-audio.swift <input> <output> [seconds]"
    case .invalidDuration:
      return "The requested duration must be greater than 0 and less than 30 seconds."
    case .missingInput:
      return "The input audio file does not exist."
    case .unreadableAudio:
      return "The input audio file has no readable PCM frames."
    case .unsupportedPCMFormat:
      return "The decoded input must provide non-interleaved Float32 PCM audio."
    }
  }
}

func prepareAudio(arguments: [String]) throws {
  guard arguments.count == 3 || arguments.count == 4 else {
    throw PreparationError.invalidArguments
  }

  let inputURL = URL(fileURLWithPath: arguments[1]).standardizedFileURL
  let outputURL = URL(fileURLWithPath: arguments[2]).standardizedFileURL
  let duration = arguments.count == 4 ? Double(arguments[3]) : 28.5

  guard let duration, duration > 0, duration < 30 else {
    throw PreparationError.invalidDuration
  }

  guard FileManager.default.fileExists(atPath: inputURL.path) else {
    throw PreparationError.missingInput
  }

  let input = try AVAudioFile(forReading: inputURL)
  let format = input.processingFormat
  let requestedFrames = AVAudioFramePosition(format.sampleRate * duration)
  let frameCount = min(input.length, requestedFrames)

  guard frameCount > 0,
    frameCount <= AVAudioFramePosition(AVAudioFrameCount.max),
    let buffer = AVAudioPCMBuffer(
      pcmFormat: format,
      frameCapacity: AVAudioFrameCount(frameCount)
    )
  else {
    throw PreparationError.unreadableAudio
  }

  try input.read(into: buffer, frameCount: AVAudioFrameCount(frameCount))
  guard let channels = buffer.floatChannelData else {
    throw PreparationError.unsupportedPCMFormat
  }

  let fadeFrames = min(
    AVAudioFrameCount(format.sampleRate * 1.5),
    buffer.frameLength
  )
  let fadeStart = buffer.frameLength - fadeFrames

  for channelIndex in 0..<Int(format.channelCount) {
    let samples = channels[channelIndex]
    for frameIndex in fadeStart..<buffer.frameLength {
      let framesRemaining = buffer.frameLength - frameIndex
      samples[Int(frameIndex)] *= Float(framesRemaining) / Float(fadeFrames)
    }
  }

  let outputSettings: [String: Any] = [
    AVFormatIDKey: kAudioFormatAppleIMA4,
    AVSampleRateKey: format.sampleRate,
    AVNumberOfChannelsKey: format.channelCount,
  ]

  if FileManager.default.fileExists(atPath: outputURL.path) {
    try FileManager.default.removeItem(at: outputURL)
  }

  let output = try AVAudioFile(forWriting: outputURL, settings: outputSettings)
  try output.write(from: buffer)
}

do {
  try prepareAudio(arguments: CommandLine.arguments)
} catch {
  FileHandle.standardError.write(Data("\(error)\n".utf8))
  exit(EXIT_FAILURE)
}
