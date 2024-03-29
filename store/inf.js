export default {
  state: () => ({
    crsmsData: null,
    expaaData: null,
    bakedExpaaData: null,
    monitorLightMap: new Map(),
    siteStatusCacheMap: new Map()
  }),
  getters: {
    crsmsData: state => state.crsmsData,
    expaaData: state => state.expaaData,
    bakedExpaaData: state => state.bakedExpaaData,
    monitorLightMap: state => state.monitorLightMap,
    siteStatusCacheMap: state => state.siteStatusCacheMap
  },
  mutations: {
    crsmsData (state, jsonPayload) {
      if (jsonPayload === null || jsonPayload === undefined) {
        state.crsmsData = jsonPayload
      }
      state.crsmsData = { ...jsonPayload }
    },
    expaaData (state, jsonPayload) {
      if (jsonPayload === null || jsonPayload === undefined) {
        state.expaaData = jsonPayload
      }
      state.expaaData = { ...jsonPayload }
    },
    bakedExpaaData (state, jsonPayload) {
      if (jsonPayload === null || jsonPayload === undefined) {
        state.bakedExpaaData = jsonPayload
      }
      state.bakedExpaaData = { ...jsonPayload }
    },
    monitorLightMap (state, objPayload) {
      state.monitorLightMap = objPayload
    },
    siteStatusCacheMap (state, objPayload) {
      state.siteStatusCacheMap = objPayload
    }
  },
  namespaced: true,
  strict: false
}
