<template lang="pug">
b-card(:border-variant="borderVariant")
  template(#header)
    .d-flex.w-100.justify-content-between
      h6.my-auto.font-weight-bolder
        lah-fa-icon(icon="circle" :variant="headerLight")
          | 全國地所跨域AP狀態
      b-button-group
        lah-button(
          variant="success",
          title="正常數量"
          pill,
          no-icon,
          v-b-tooltip.v-success,
          @click="displayError = false"
        )
          //- span.mr-1 告警
          b-badge(variant="light", pill) {{ upCount }}
        lah-button.mx-1(
          variant="danger",
          title="異常數量"
          pill,
          no-icon,
          v-b-tooltip.v-danger,
          @click="displayError = true"
        )
          //- span.mr-1 回復
          b-badge(variant="light", pill) {{ downCount }}
        lah-button(
          to="/inf/xap/connectivity",
          icon="arrow-up-right-from-square",
          no-border,
          title="即時全國地所狀態"
        )
        lah-button(
          icon="sync",
          action="cycle",
          variant="outline-secondary",
          title="重新讀取",
          no-border,
          @click="reload(true)"
        )
        lah-button(
          icon="question",
          action="breath",
          variant="outline-success",
          no-border,
          no-icon-gutter,
          @click="$refs.help.show()",
          title="說明"
        )
    lah-help-modal(ref="help", :modal-title="`各所跨域AP服務狀態監控說明`")
      ul
        li 顯示各地所(全國)連線狀態
        li 每5分鐘重新更新一次
      hr
      div 🟢 表示服務正常
      div 🟡 表示連線逾時
      div 🔴 表示狀態錯誤
  .h-100.overflow-auto.max-height
    lah-transition
      .mt-3.text-center(v-if="isBusy")
        lah-fa-icon.h4(icon="spinner", variant="dark", action="spin") 讀取中 ...
      .mt-3.text-center(v-else-if="downCount === 0 && displayError")
        lah-fa-icon.h4(icon="circle-check", variant="success") 無偵測到異常

    lah-site-status-badge.m-1(
      v-for="office in displayOffices",
      :ref="office.id",
      :key="office.id",
      :static-data="office",
      :fill="false",
      :badge="false",
      short
    )
</template>

<script>
export default {
  name: 'LahMonitorBoardSiteTw',
  emit: ['light-update'],
  props: {
    updatePeriod: { type: String, default: '300000' } // 5 mins
  },
  data: () => ({
    officesData: [],
    displayError: true,
    timer: null
  }),
  fetch () {
    this.reload()
  },
  computed: {
    count () {
      return this.officesData.length
    },
    displayOffices () {
      return this.displayError ? this.downOffices : this.upOffices
    },
    downOffices () {
      return [...this.officesData.filter(siteData => siteData.state === 'DOWN')]
    },
    downCount () {
      return this.downOffices.length
    },
    upOffices () {
      return [...this.officesData.filter(siteData => siteData.state === 'UP')]
    },
    upCount () {
      return this.upOffices.length
    },
    headerLight () {
      if (this.count === 0) {
        return 'secondary'
      }
      if (this.downCount > 0) {
        // only have timeout sites
        if (this.downOffices.every(o => o.response === '')) {
          return 'warning'
        }
        return 'danger'
      }
      return 'success'
    },
    borderVariant () {
      if (['danger', 'warning'].includes(this.headerLight)) {
        return this.headerLight
      }
      return 'muted'
    }
  },
  watch: {
    headerLight (nlight, olight) {
      this.$emit('light-update', {
        name: this.componentName,
        new: nlight,
        old: olight
      })
    },
    officesData (val) {
      // testing
      // val.forEach((element, idx) => {
      //   element.state = this.$utils.rand(5) !== 1 ? 'UP' : 'DOWN'
      // })
    }
  },
  created () {},
  mounted () {},
  methods: {
    reload (force = false) {
      clearTimeout(this.timer)
      this.isBusy = true
      this.officesData = []
      this.$axios
        .post(this.$consts.API.JSON.STATS, {
          type: 'stats_xap_stats',
          force
        })
        .then(({ data }) => {
          if (this.$utils.statusCheck(data.status)) {
            this.officesData = [...data.raw]
          }
        })
        .catch((err) => {
          this.$utils.error(err)
        })
        .finally(() => {
          this.isBusy = false
          this.timeout(this.reload, 5 * 60 * 1000).then((handle) => { this.timer = handle })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.max-height {
  max-height: 25vh;
  overflow: auto;
}
</style>