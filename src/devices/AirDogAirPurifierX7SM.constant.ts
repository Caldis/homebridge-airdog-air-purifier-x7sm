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
export enum AirPurifierSwitchStatusGetCode { On = 'on',  Off = 'off' }
export enum AirPurifierSwitchStatusSetCode { On = 1,  Off = 0 }

// 运行模式枚举
export enum AirPurifierModeGetCode { Auto = 'auto', Manual = 'manual', Sleep = 'sleep' }
export enum AirPurifierModeSetCode { Auto = 0, Manual = 1, Sleep = 2 }

// 风扇级别枚举
export enum AirPurifierFanLevelGetCode { _,  Level1, Level2, Level3, Level4, Level5 }
export enum AirPurifierFanLevelSetCode { _,  Level1, Level2, Level3, Level4, Level5 }
export const AirPurifierFanLevelCodeMapping = {
  [AirPurifierFanLevelSetCode._]: 0,
  [AirPurifierFanLevelSetCode.Level1]: 20,
  [AirPurifierFanLevelSetCode.Level2]: 40,
  [AirPurifierFanLevelSetCode.Level3]: 60,
  [AirPurifierFanLevelSetCode.Level4]: 80,
  [AirPurifierFanLevelSetCode.Level5]: 100,
}

// 锁定状态枚举
export enum AirPurifierLockGetCode { Lock = 'lock', Unlock = 'unlock' }
export enum AirPurifierLockSetCode { Lock = 1, Unlock = 0 }

// 清洁状态枚举
export enum AirPurifierCleanCode { Yes = 'y', No = 'n' }
