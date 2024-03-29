<template lang="pug">
  div
    lah-header: lah-transition(appear): .d-flex.justify-content-between.w-100
      .d-flex
        .my-auto 取消請示案件
        lah-button(icon="info" action="bounce" variant="outline-success" no-border no-icon-gutter @click="showModalById('help-modal')" title="說明")
        lah-help-modal(:modal-id="'help-modal'")
          .h5 搜尋說明：
          ul
            li 根據收件日期區間查詢
            li 取消請示日期(RM83)欄位不為空值之案件
          hr
          .h5 取消請示案件狀態說明：
          .mx-2: lah-fa-icon(icon="circle" variant="danger") 有申請取消請示紀錄且#[strong.text-danger 已]逾期案件
          .mx-2: lah-fa-icon(icon="circle" variant="warning") 有申請取消請示紀錄且於預訂結案日結案之案件
          .mx-2: lah-fa-icon(icon="circle" variant="success") 有申請取消請示紀錄且#[strong 未]逾期案件

      .d-flex.text-nowrap
        lah-datepicker.mr-1(v-model="dateRange")
        //- b-form-input.my-auto.mr-2(type="range" v-model="months" min="1" max="12")
        //- span.my-auto.mr-2 {{ months }}個月內
        lah-button(
          ref="search"
          icon="search"
          size="lg"
          title="搜尋"
          :disabled="isBusy || dateRange.days < 1"
          @click="$fetch"
          no-icon-gutter
        )
        lah-button-xlsx.mx-1(
          :jsons="xlsxData"
          header="取消請示案件"
        )
        lah-countdown-button(
          ref="countdown"
          icon="sync-alt"
          action="ld-cycle"
          size="lg"
          title="立即重新讀取"
          variant="outline-secondary"
          badge-variant="secondary"
          auto-start
          no-badge
          @end="reload"
          @click="reload"
          :milliseconds="cachedMs"
          :disabled="isBusy || dateRange.days < 1"
          :busy="isBusy"
        )
    lah-transition(appear): lah-reg-b-table(
      :busy="isBusy"
      :baked-data="bakedData"
      :fields="fields"
    )
    lah-transition: .center.h3: lah-fa-icon(
      v-cloak
      v-if="queryCount === 0 && !isBusy"
      icon="exclamation-circle"
      variant="success"
    ) 無資料
</template>

<script>
export default {
  data: () => ({
    bakedData: [],
    committed: false,
    cachedMs: 60 * 60 * 1000,
    forceReload: false,
    dateRange: {
      begin: '',
      end: '',
      days: 0
    },
    months: 1,
    fields: [
      {
        key: '請示燈號',
        label: '狀態',
        sortable: true
      },
      {
        key: '收件字號',
        sortable: true
      },
      {
        key: '收件日期',
        sortable: true
      },
      {
        key: '登記原因',
        sortable: true
      },
      {
        key: '辦理情形',
        sortable: true
      },
      {
        key: '初審人員',
        sortable: true
      },
      {
        key: '請示日期',
        sortable: true
      },
      {
        key: '取消請示日期',
        label: '取消請示',
        sortable: true
      },
      {
        key: '預定結案日期',
        label: '預定結案',
        sortable: true
      },
      {
        key: '結案日期',
        sortable: true
      }
    ]
  }),
  fetch () {
    if (this.$utils.empty(this.dateRange.begin) || this.$utils.empty(this.dateRange.end)) {
      this.$utils.warn('dateRange is not ready ... postpone $fetch')
      this.timeout(this.$fetch, 250)
    } else {
      this.getCache(this.cacheKey).then((json) => {
        if (this.forceReload === true || json === false) {
          this.isBusy = true
          this.$axios.post(this.$consts.API.JSON.PREFETCH, {
            type: 'reg_cancel_ask_case',
            reload: this.forceReload,
            begin: this.dateRange.begin,
            end: this.dateRange.end
          }).then(({ data }) => {
            this.bakedData = data.baked || []
            this.notify(data.message, { type: this.$utils.statusCheck(data.status) ? 'info' : 'warning' })
            const remain_s = data.cache_remaining_time
            const remain_ms = remain_s * 1000
            if (remain_ms && remain_ms > 0) {
              this.setCache(this.cacheKey, data, remain_ms)
              // use server side cache remaining time
              this.$refs.countdown.setCountdown(remain_ms)
            } else {
              this.$refs.countdown.setCountdown(this.cachedMs)
            }
            this.$refs.countdown.startCountdown()
          })
            .catch((err) => {
              this.alert(err.message)
              this.$utils.error(err)
            })
            .finally(() => {
              this.isBusy = false
              this.forceReload = false
            })
        } else {
          this.bakedData = json.baked || []
          this.resetCountdown()
          this.getCacheExpireRemainingTime(this.cacheKey).then((remaining) => {
            this.notify(`查詢成功，找到 ${this.bakedData.length} 筆取消請示案件資料。`, { subtitle: `(快取) ${this.$utils.msToHuman(remaining)} 後更新` })
          })
        }
      })
    }
  },
  head: {
    title: '取消請示案件查詢-桃園市地政局'
  },
  fetchOnServer: false,
  computed: {
    dataReady () { return this.queryCount > 0 },
    queryCount () { return this.bakedData?.length || 0 },
    cacheKey () { return `reg_cancel_ask_case_${this.dateRange.begin}_${this.dateRange.end}` },
    xlsxData () {
      // prepare json objects for xlsx exporting
      const fieldKeys = this.fields.map((field, idx, array) => field.key)
      const jsons = this.bakedData.map((data, idx, array) => {
        const obj = {}
        for (const [key, value] of Object.entries(data)) {
          if (key !== '請示燈號' && fieldKeys.includes(key)) {
            obj[key] = value
          }
        }
        return obj
      })
      return jsons
    }
  },
  methods: {
    resetCountdown () {
      if (this.$refs.countdown) {
        this.getCacheExpireRemainingTime(this.cacheKey).then((remain_ms) => {
          if (remain_ms > 0) {
            this.$refs.countdown.setCountdown(remain_ms)
            this.$refs.countdown.startCountdown()
            this.$utils.log(`${this.cacheKey} 快取資料將在 ${(remain_ms / 1000).toFixed(1)} 秒後到期。`)
          }
        })
      }
    },
    reload () {
      this.removeCache(this.cacheKey).then(() => {
        this.forceReload = true
        this.$fetch()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
