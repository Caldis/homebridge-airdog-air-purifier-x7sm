"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirPurifierCleanCode = exports.AirPurifierLockSetCode = exports.AirPurifierLockGetCode = exports.AirPurifierFanLevelCodeMapping = exports.AirPurifierFanLevelSetCode = exports.AirPurifierFanLevelGetCode = exports.AirPurifierModeSetCode = exports.AirPurifierModeGetCode = exports.AirPurifierSwitchStatusSetCode = exports.AirPurifierSwitchStatusGetCode = exports.Specs = void 0;
// 特性信息
exports.Specs = {
    // 启动状态
    AirPurifierSwitchStatus: 'power',
    // 风扇级别
    AirPurifierFanLevel: 'speed',
    // 运行模式
    AirPurifierMode: 'mode',
    // 环境质量
    EnvironmentPM25Density: 'pm',
    EnvironmentHCHODensity: 'hcho',
    // 锁定控制
    PhysicalControlLocked: 'lock',
    // 清洁指示
    PhysicalCleanNeeded: 'clean',
};
// 启动状态枚举
var AirPurifierSwitchStatusGetCode;
(function (AirPurifierSwitchStatusGetCode) {
    AirPurifierSwitchStatusGetCode["On"] = "on";
    AirPurifierSwitchStatusGetCode["Off"] = "off";
})(AirPurifierSwitchStatusGetCode = exports.AirPurifierSwitchStatusGetCode || (exports.AirPurifierSwitchStatusGetCode = {}));
var AirPurifierSwitchStatusSetCode;
(function (AirPurifierSwitchStatusSetCode) {
    AirPurifierSwitchStatusSetCode[AirPurifierSwitchStatusSetCode["On"] = 1] = "On";
    AirPurifierSwitchStatusSetCode[AirPurifierSwitchStatusSetCode["Off"] = 0] = "Off";
})(AirPurifierSwitchStatusSetCode = exports.AirPurifierSwitchStatusSetCode || (exports.AirPurifierSwitchStatusSetCode = {}));
// 运行模式枚举
var AirPurifierModeGetCode;
(function (AirPurifierModeGetCode) {
    AirPurifierModeGetCode["Auto"] = "auto";
    AirPurifierModeGetCode["Manual"] = "manual";
    AirPurifierModeGetCode["Sleep"] = "sleep";
})(AirPurifierModeGetCode = exports.AirPurifierModeGetCode || (exports.AirPurifierModeGetCode = {}));
var AirPurifierModeSetCode;
(function (AirPurifierModeSetCode) {
    AirPurifierModeSetCode[AirPurifierModeSetCode["Auto"] = 0] = "Auto";
    AirPurifierModeSetCode[AirPurifierModeSetCode["Manual"] = 1] = "Manual";
    AirPurifierModeSetCode[AirPurifierModeSetCode["Sleep"] = 2] = "Sleep";
})(AirPurifierModeSetCode = exports.AirPurifierModeSetCode || (exports.AirPurifierModeSetCode = {}));
// 风扇级别枚举
var AirPurifierFanLevelGetCode;
(function (AirPurifierFanLevelGetCode) {
    AirPurifierFanLevelGetCode[AirPurifierFanLevelGetCode["_"] = 0] = "_";
    AirPurifierFanLevelGetCode[AirPurifierFanLevelGetCode["Level1"] = 1] = "Level1";
    AirPurifierFanLevelGetCode[AirPurifierFanLevelGetCode["Level2"] = 2] = "Level2";
    AirPurifierFanLevelGetCode[AirPurifierFanLevelGetCode["Level3"] = 3] = "Level3";
    AirPurifierFanLevelGetCode[AirPurifierFanLevelGetCode["Level4"] = 4] = "Level4";
    AirPurifierFanLevelGetCode[AirPurifierFanLevelGetCode["Level5"] = 5] = "Level5";
})(AirPurifierFanLevelGetCode = exports.AirPurifierFanLevelGetCode || (exports.AirPurifierFanLevelGetCode = {}));
var AirPurifierFanLevelSetCode;
(function (AirPurifierFanLevelSetCode) {
    AirPurifierFanLevelSetCode[AirPurifierFanLevelSetCode["_"] = 0] = "_";
    AirPurifierFanLevelSetCode[AirPurifierFanLevelSetCode["Level1"] = 1] = "Level1";
    AirPurifierFanLevelSetCode[AirPurifierFanLevelSetCode["Level2"] = 2] = "Level2";
    AirPurifierFanLevelSetCode[AirPurifierFanLevelSetCode["Level3"] = 3] = "Level3";
    AirPurifierFanLevelSetCode[AirPurifierFanLevelSetCode["Level4"] = 4] = "Level4";
    AirPurifierFanLevelSetCode[AirPurifierFanLevelSetCode["Level5"] = 5] = "Level5";
})(AirPurifierFanLevelSetCode = exports.AirPurifierFanLevelSetCode || (exports.AirPurifierFanLevelSetCode = {}));
exports.AirPurifierFanLevelCodeMapping = {
    [AirPurifierFanLevelSetCode._]: 0,
    [AirPurifierFanLevelSetCode.Level1]: 20,
    [AirPurifierFanLevelSetCode.Level2]: 40,
    [AirPurifierFanLevelSetCode.Level3]: 60,
    [AirPurifierFanLevelSetCode.Level4]: 80,
    [AirPurifierFanLevelSetCode.Level5]: 100,
};
// 锁定状态枚举
var AirPurifierLockGetCode;
(function (AirPurifierLockGetCode) {
    AirPurifierLockGetCode["Lock"] = "lock";
    AirPurifierLockGetCode["Unlock"] = "unlock";
})(AirPurifierLockGetCode = exports.AirPurifierLockGetCode || (exports.AirPurifierLockGetCode = {}));
var AirPurifierLockSetCode;
(function (AirPurifierLockSetCode) {
    AirPurifierLockSetCode[AirPurifierLockSetCode["Lock"] = 1] = "Lock";
    AirPurifierLockSetCode[AirPurifierLockSetCode["Unlock"] = 0] = "Unlock";
})(AirPurifierLockSetCode = exports.AirPurifierLockSetCode || (exports.AirPurifierLockSetCode = {}));
// 清洁状态枚举
var AirPurifierCleanCode;
(function (AirPurifierCleanCode) {
    AirPurifierCleanCode["Yes"] = "y";
    AirPurifierCleanCode["No"] = "n";
})(AirPurifierCleanCode = exports.AirPurifierCleanCode || (exports.AirPurifierCleanCode = {}));
