<template lang="pug">
b-card(:border-variant="border")
  template(#header): .d-flex.justify-content-between
    lah-fa-icon(icon="circle", :variant="light")
    lah-fa-icon.font-weight-bold(icon="comment-sms", append) {{ header }}
    b-button-group.ml-auto(size="sm")
      lah-button(
        v-if="!footer"
        icon="sync-alt",
        action="ld-cycle",
        variant="outline-secondary",
        no-border,
        no-icon-gutter,
        @click="reload",
        :title="`上次更新時間 ${updated}`"
      )
      lah-button(
        icon="arrow-up-right-from-square",
        variant="outline-primary",
        no-border,
        no-icon-gutter,
        title="打開查詢視窗",
        @click="popupSMS"
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
    lah-help-modal(ref="help", :modal-title="`${header} 監控說明`")
      ul
        li 顯示今日地政系統簡訊發送狀態
        li 儀表板每{{ reloadMs / 1000 / 60 }}分鐘重新檢查一次
      hr
      div 👉🏻 點擊紀錄內容開啟詳細記錄視窗
      div 🟢 表示一切正常
      div 🟡 表示找不到任何簡訊訊息
      div 🔴 表示今日找不到案件辦理情形的簡訊({{ today }})
  slot
  lah-transition
    .center(v-if="isBusy"): lah-fa-icon(
      icon="spinner",
      action="spin"
    ) 讀取中...
    section(v-else)
      .d-flex.justify-content-between.align-items-center
        div - 地籍異動即時通
        b-link(@click="popupSingleSMS(firstNotifyLog)") {{ firstNotifyLog.SMS_CELL }}
        lah-badge-human-datetime(:seconds="convertSeconds(firstNotifyLog)")
      .truncate.small.text-muted: b-link(@click="popupSingleSMS(firstNotifyLog)") {{ firstNotifyLog.SMS_CONTENT }}
      hr
      .d-flex.justify-content-between.align-items-center
        div - 案件辦理情形
        b-link(@click="popupSingleSMS(firstCaseLog)") {{ firstCaseLog.SMS_CELL }}
        lah-badge-human-datetime(:seconds="convertSeconds(firstCaseLog)")
      .truncate.small.text-muted: b-link(@click="popupSingleSMS(firstCaseLog)") {{ firstCaseLog.SMS_CONTENT }}
      hr
      .d-flex.justify-content-between.align-items-center
        div - 其他簡訊
        b-link(@click="popupSingleSMS(firstOtherLog)") {{ firstOtherLog.SMS_CELL }}
        lah-badge-human-datetime(:seconds="convertSeconds(firstOtherLog)")
      .truncate.small.text-muted: b-link(@click="popupSingleSMS(firstOtherLog)") {{ firstOtherLog.SMS_CONTENT }}

  template(#footer, v-if="footer"): client-only: lah-monitor-board-footer(
    ref="footer"
    :reload-ms="reloadMs",
    :busy="isBusy",
    :fetch="$fetch",
    :reload="loadSMS",
    :update-time="updated"
  )
</template>

<script>
import lahAdmSmslogTableVue from '~/components/lah-adm-smslog-table.vue'
export default {
  name: 'LahMonitorBoardSms',
  emit: ['light-update'],
  components: { lahAdmSmslogTableVue },
  props: {
    footer: { type: Boolean, default: false }
  },
  data: () => ({
    header: '地政系統簡訊狀態監控',
    today: '',
    updated: '',
    logs: [],
    message: '讀取中',
    reloadMs: 5 * 60 * 1000
  }),
  fetch () {
    this.today = this.$utils.today('TW')
    this.loadSMS()
  },
  computed: {
    firstNotifyLog () {
      const log = this.notifyLogs[0]
      if (this.$utils.empty(log)) {
        return {}
      }
      return log
    },
    notifyLogs () {
      return this.logs.filter((item) => {
        return item.SMS_TYPE === '地籍異動即時通'
      })
    },
    firstCaseLog () {
      const log = this.caseLogs[0]
      if (this.$utils.empty(log)) {
        return {}
      }
      return log
    },
    caseLogs () {
      return this.logs.filter((item) => {
        return item.SMS_TYPE === '案件辦理情形'
      })
    },
    firstOtherLog () {
      const log = this.otherLogs[0]
      if (this.$utils.empty(log)) {
        return {}
      }
      return log
    },
    otherLogs () {
      return this.logs.filter((item) => {
        return !['案件辦理情形', '地籍異動即時通'].includes(item.SMS_TYPE)
      })
    },
    border () {
      if (this.light !== 'success') {
        return this.light
      }
      return ''
    },
    light () {
      if (this.logs?.length !== 0) {
        if (!this.firstCaseLog) {
          return 'danger'
        }
        return 'success'
      }
      return 'warning'
    }
  },
  watch: {
    logs (val) {
      // console.warn(val)
    },
    otherLogs (val) {
      // console.warn(val)
    },
    light (nlight, olight) {
      this.emitLightUpdate(nlight, olight)
    }
  },
  created () {},
  mounted () {
    this.emitLightUpdate(this.light, '')
  },
  beforeDestroy () {
    this.emitLightUpdate('', this.light)
  },
  methods: {
    emitLightUpdate (n, o) {
      this.$emit('light-update', {
        name: 'LahMonitorBoardSms',
        new: n,
        old: o
      })
    },
    convertSeconds (item) {
      if (!this.$utils.empty(item)) {
        const adDate = `${parseInt(item.SMS_DATE) + 19110000}`
        const time = item.SMS_TIME
        const obj = Date.parse(`${this.$utils.addDateDivider(adDate, true)}T${this.$utils.addTimeDivider(time)}`)
        return +obj / 1000
      }
      return -1
    },
    subjectLight (item) {
      // const list = this.subjectCss(item)
      // return list.includes('text-danger') ? '🔴' : '🟢'
      return '🟢'
    },
    subjectCss (item) {
      // parsing message for the successful text
      // if (item.subject === this.todayNoAdSyncMessage) {
      //   return ['text-danger']
      // }
      return []
    },
    loadSMS () {
      if (!this.isBusy) {
        this.isBusy = true
        this.logs = []
        this.$axios
          .post(this.$consts.API.JSON.MOISMS, {
            type: 'moisms_log_query',
            keyword: this.today.replaceAll('-', '')
          }).then(({ data }) => {
            const status = this.$utils.statusCheck(data.status) ? '🟢' : '⚠'
            this.message = `${status} ${data.message}`
            this.logs = [...data.raw]
            this.$emit('reload', {
              keyword: this.keyword,
              logs: this.logs
            })
          }).catch((err) => {
            this.error = err
          }).finally(() => {
            this.isBusy = false
            this.updated = this.$utils.now('TW').replace(this.today, '')
          })
      }
    },
    popupSMS () {
      this.modal(this.$createElement(lahAdmSmslogTableVue, {
        props: {
          inKeyword: this.today,
          inLogs: this.logs
        }
      }), {
        title: '地政系統簡訊綜合記錄檔查詢',
        size: 'xl',
        noCloseOnBackdrop: true,
        centered: false,
        scrollable: false
      })
    },
    popupSingleSMS (item) {
      this.modal(this.$createElement(lahAdmSmslogTableVue, {
        props: {
          inKeyword: this.today,
          inLogs: [item]
        }
      }), {
        title: '地政系統簡訊綜合記錄檔查詢',
        size: 'xl',
        noCloseOnBackdrop: true,
        centered: false,
        scrollable: false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
ul {
  padding-left: 21.25px;
}
</style>