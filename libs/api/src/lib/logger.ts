import chalk from "chalk";

const LogLevel = {
  Error: "ERROR",
  Warn: "WARN",
  Info: "INFO",
  Debug: "DEBUG",
  Verbose: "VERBOSE",
} as const;

type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export class Logger {
  private static defaultContext = "DefaultContext";
  private static defaultTimestamp = false;

  private context?: string;
  private timestamp: boolean;

  constructor(context: string = Logger.defaultContext, options: { timestamp?: boolean } = {}) {
    this.context = context;
    this.timestamp = options.timestamp ?? Logger.defaultTimestamp;
  }

  private static formatMessage(
    level: LogLevel,
    message: unknown,
    context: string,
    timestamp: boolean,
  ): string {
    let result = `[${level}]`;
    if (timestamp) {
      result += ` ${new Date().toISOString()}`;
    }
    result += ` [${context}] ${message}`;
    return result;
  }

  private static colorize(level: LogLevel, message: string): string {
    switch (level) {
      case LogLevel.Error:
        return chalk.red(message);
      case LogLevel.Warn:
        return chalk.yellow(message);
      case LogLevel.Info:
        return chalk.blue(message);
      case LogLevel.Debug:
        return chalk.magenta(message);
      case LogLevel.Verbose:
        return chalk.cyan(message);
      default:
        return message;
    }
  }

  private static logMessage(
    level: LogLevel,
    message: unknown,
    context: string = Logger.defaultContext,
  ): void {
    const formattedMessage = Logger.formatMessage(level, message, context, Logger.defaultTimestamp);
    const coloredMessage = Logger.colorize(level, formattedMessage);
    switch (level) {
      case LogLevel.Error:
        console.error(coloredMessage);
        break;
      case LogLevel.Warn:
        console.warn(coloredMessage);
        break;
      case LogLevel.Info:
      case LogLevel.Verbose:
        console.log(coloredMessage);
        break;
      case LogLevel.Debug:
        // eslint-disable-next-line dot-notation
        if (process.env["NODE_ENV"] !== "production") {
          console.debug(coloredMessage);
        }
        break;
    }
  }

  public error(message: unknown, context?: string): void {
    Logger.logMessage(LogLevel.Error, message, context ?? this.context);
  }

  public warn(message: unknown, context?: string): void {
    Logger.logMessage(LogLevel.Warn, message, context ?? this.context);
  }

  public log(message: unknown, context?: string): void {
    Logger.logMessage(LogLevel.Info, message, context ?? this.context);
  }

  public debug(message: unknown, context?: string): void {
    Logger.logMessage(LogLevel.Debug, message, context ?? this.context);
  }

  public verbose(message: unknown, context?: string): void {
    Logger.logMessage(LogLevel.Verbose, message, context ?? this.context);
  }

  // Static methods
  public static error(message: unknown, context: string = Logger.defaultContext): void {
    Logger.logMessage(LogLevel.Error, message, context);
  }

  public static warn(message: unknown, context: string = Logger.defaultContext): void {
    Logger.logMessage(LogLevel.Warn, message, context);
  }

  public static log(message: unknown, context: string = Logger.defaultContext): void {
    Logger.logMessage(LogLevel.Info, message, context);
  }

  public static debug(message: unknown, context: string = Logger.defaultContext): void {
    Logger.logMessage(LogLevel.Debug, message, context);
  }

  public static verbose(message: unknown, context: string = Logger.defaultContext): void {
    Logger.logMessage(LogLevel.Verbose, message, context);
  }
}
