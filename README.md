# homebridge-airdog-air-purifier-x7sm

HomeBridge Plugin for AirDog Air Purifier X7S(m)

HomeBridge 贝昂 X7S 无耗材 空气净化器 插件

## 对应特征
- airdog.airpurifier.x7sm
- 贝昂 X7S 无耗材空气净化器
- http://www.beiangtech.com/product/15

其余型号无条件测试，不保证可用性

## 安装
```bash
npm i homebridge-airdog-air-purifier-x7sm@latest
```

## 配置
```json
{
  "platforms": [
    {
      "platform": "AirDogAirPurifierX7SM",
      "devices": [
        {
          "name": "Name",
          "address": "IP Address",
          "token": "Token"
        }
      ]
    }
  ]
}
```

## 参考
https://github.com/syssi/xiaomi_airpurifier/issues/72#issuecomment-711722428
