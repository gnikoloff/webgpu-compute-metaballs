import { QualityOption, QualitySettings } from './protocol'

export const QUALITIES: Map<QualitySettings, QualityOption> = new Map([
  [
    QualitySettings.LOW,
    {
      bloomToggle: false,
      shadowRes: 128,
      pointLightsCount: 16,
      outputScale: 0.5,
    },
  ],
  [
    QualitySettings.MEDIUM,
    {
      bloomToggle: true,
      shadowRes: 256,
      pointLightsCount: 32,
      outputScale: 1,
    },
  ],
  [
    QualitySettings.HIGH,
    {
      bloomToggle: true,
      shadowRes: 512,
      pointLightsCount: 128,
      outputScale: 1,
    },
  ],
])

let _quality: QualitySettings

export const SETTINGS = {
  get qualityLevel() {
    return QUALITIES.get(_quality)
  },
  get quality(): QualitySettings {
    return _quality
  },
  set quality(v: QualitySettings) {
    _quality = v
  },
}
