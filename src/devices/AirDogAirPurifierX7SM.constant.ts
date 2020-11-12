// 特性信息
export const Specs = {
  // 启动状态
  AirPurifierSwitchStatus: 'power',
  // 风扇级别
  AirPurifierFanLevel: 'speed',
  // 运行模式
  AirPurifierMode: 'mode',
  // 环境质量
  EnvironmentPM25Density: 'pm', // PM2.5
  EnvironmentHCHODensity: 'hcho', // 甲醛
  // 锁定控制
  PhysicalControlLocked: 'lock',
  // 清洁指示
  PhysicalCleanNeeded: 'clean',
}

// 启动状态枚举
export enum AirPurifierSwitchStatusCode { On = 'on',  Off = 'off' }

// 运行模式枚举
export enum AirPurifierModeCode { Auto = 'auto',  Sleep = 'sleep', Manual = 'manual' }

// 风扇级别枚举
export enum AirPurifierFanLevelCode { _,  Level1, Level2, Level3, Level4, Level5 }
export const AirPurifierFanLevelCodeMapping = {
  [AirPurifierFanLevelCode._]: 0,
  [AirPurifierFanLevelCode.Level1]: 20,
  [AirPurifierFanLevelCode.Level2]: 40,
  [AirPurifierFanLevelCode.Level3]: 60,
  [AirPurifierFanLevelCode.Level4]: 80,
  [AirPurifierFanLevelCode.Level5]: 100,
}

// 锁定状态枚举
export enum AirPurifierLockCode { Lock = 'lock', Unlock = 'unlock' }

// 清洁状态枚举
export enum AirPurifierCleanCode { Yes = 'y', No = 'n' }
