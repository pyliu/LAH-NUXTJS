<template lang="pug">
b-card.border-0(no-body)
  div(v-if="brief")
    b-row
      b-col 結帳日期：{{ expaaData.AA01 }}
      b-col 作業人員：{{ expaaData.AA39 }}
    b-row.mt-1
      b-col 電腦給號：{{ expaaData.AA04 }}
      b-col 收據編號：{{ expaaData.AA05 }}
    hr

  .w-100(:class="vertical ? ['d-flex-column'] : ['d-flex']")
    //- 列印狀態
    .d-flex.flex-nowrap
      b-input-group(size="sm" prepend="列印狀態"): b-select(
        ref="print",
        v-model="printVal",
        :options="printOpts"
      )
      lah-button.ml-1(
        icon="edit",
        @click="updateAA09",
        size="sm",
        variant="outline-primary",
        title="更新列印狀態",
        :disabled="!validData"
      )
        span(v-if="vertical") 修改
    //- 付款方式
    .d-flex.flex-nowrap(:class="vertical ? ['my-1'] : ['mx-1']")
      b-input-group(size="sm" prepend="付款方式"): b-select(
        ref="payment",
        v-model="paymentVal",
        :options="paymentOpts"
      )
      lah-button.ml-1(
        icon="edit",
        @click="updateAA100",
        size="sm",
        variant="outline-primary",
        title="更新付款方式",
        :disabled="!validData"
      )
        span(v-if="vertical") 修改
    //- 作廢狀態
    .d-flex.flex-nowrap
      b-input-group(size="sm" prepend="收據狀態"): b-select(
        ref="obsolete",
        v-model="obsoleteVal",
        :options="obsoleteOpts"
      )
      lah-button.ml-1(
        icon="edit",
        @click="updateAA08",
        size="sm",
        variant="outline-primary",
        title="更新收據狀態",
        :disabled="!validData"
      )
        span(v-if="vertical") 修改
</template>

<script>
export default {
  props: {
    expaaData: { type: Object, default: () => ({}) },
    noConfirm: { type: Boolean, default: false },
    vertical: { type: Boolean, default: true },
    brief: { type: Boolean, default: false }
  },
  data: () => ({
    printOpts: [{
      value: 0,
      text: '未印[0]'
    }, {
      value: 1,
      text: '已印[1]'
    }],
    printVal: 1,
    paymentVal: 1,
    paymentOpts: [],
    paymentOptExpkCacheKey: 'moiexp.expk',
    paymentOptExpk: [],
    obsoleteOpts: [{
      value: 0,
      text: "作廢[0]"
    }, {
      value: 1,
      text: "正常[1]"
    }],
    obsoleteVal: 1,
  }),
  computed: {
    day () {
      return this.expaaData?.AA01 || '' // 收據日期 e.g. '1110915'
    },
    pcNumber () {
      return this.expaaData?.AA04 || '' // 電腦給號 e.g. '0123456'
    },
    aaNumber () {
      return this.expaaData?.AA05 || '' // 收據編號 e.g. 'AA12345678'
    },
    validData () {
      return this.day !== '' && this.pcNumber !== '' && this.aaNumber !== ''
    }
  },
  watch: {
    paymentOptExpk (val) {
      this.paymentOpts = val?.map((item, idx, arr) => {
        return {
          text: `[${item.K01}] ${item.K02}`,
          value: item.K01
        }
      }) || []
    }
  },
  created () {
    this.checkPaymentExpkData()
    this.obsoleteVal = this.expaaData.AA08
    this.printVal = this.expaaData.AA09
    this.paymentVal = this.expaaData.AA100
  },
  methods: {
    async checkPaymentExpkData () {
      const cachedExpk = await this.getCache(this.paymentOptExpkCacheKey)
      if (cachedExpk) {
        this.paymentOptExpk = [...cachedExpk]
      } else {
        this.isBusy = true
        this.$axios.post(this.$consts.API.JSON.QUERY, {
          type: "expk"
        }).then(res => {
          if (res.data.data_count > 0) {
            this.paymentOptExpk = [...res.data.raw]
            // set expire time to 7 days
            this.setCache(this.paymentOptExpkCacheKey, this.paymentOptExpk, 7 * 24 * 60 * 60 * 1000)
            this.info(`已更新 ${this.paymentOptExpk.length} 筆付款項目資料。`, { title: "查詢規費付款項目" })
          } else {
            this.alert(`查無規費付款項目資料`, { title: "查詢規費付款項目" })
          }
        }).catch(err => {
          this.$utils.error(err)
        }).finally(() => {
          this.isBusy = false
        })
      }
    },
    xhrAAXX (type, val, title) {
      this.isBusy = true
      this.$axios.post(this.consts.API.JSON.QUERY, {
        type,
        date: this.day,
        number: this.pcNumber,
        update_value: val
      }).then((res) => {
        if (this.$utils.statusCheck(res.data.status)) {
          this.success(res.data.message, {
            title: `修改${title}成功`,
            subtitle: this.aaNumber
          })
        } else {
          this.alert(res.data.message, {
            title: `修改${title}失敗`,
            subtitle: this.aaNumber
          })
        }
      }).catch((err) => {
        this.$utils.error(err)
      }).finally(() => {
        this.isBusy = false
      })
    },
    updateAA08 () {
      if (this.noConfirm) {
        this.xhrAAXX('expaa_AA08_update', this.obsoleteVal, '收據狀態')
      } else {
        this.confirm('確定要修改收據狀態？').then((YN) => {
          if (YN) {
            this.xhrAAXX('expaa_AA08_update', this.obsoleteVal, '收據狀態')
          }
        })
      }
    },
    updateAA09 () {
      if (this.noConfirm) {
        this.xhrAAXX('expaa_AA09_update', this.printVal, '列印狀態')
      } else {
        this.confirm('確定要修改列印狀態？').then((YN) => {
          if (YN) {
            this.xhrAAXX('expaa_AA09_update', this.printVal, '列印狀態')
          }
        })
      }
    },
    updateAA100 () {
      if (this.noConfirm) {
        this.xhrAAXX('expaa_AA100_update', this.paymentVal, '付款方式')
      } else {
        this.confirm('確定要修改付款方式？').then((YN) => {
          if (YN) {
            this.xhrAAXX('expaa_AA100_update', this.paymentVal, '付款方式')
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>