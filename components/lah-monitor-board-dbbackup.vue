<template lang="pug">
b-card
  template(#header): .d-flex.justify-content-between
    lah-fa-icon(icon="circle", :variant="light")
    strong {{ header }}
    b-button-group.ml-auto(
      size="sm"
    )
      lah-button(
        icon="sync-alt",
        action="ld-cycle",
        variant="outline-secondary",
        no-border,
        no-icon-gutter,
        @click="reload",
        title="重新讀取"
      )
      lah-button(
        icon="external-link-alt",
        variant="outline-primary",
        no-border,
        no-icon-gutter,
        @click="popupMessages('subject', 'BACKUP OPTION', 7)",
        title="讀取7天內訊息"
      )
      lah-button(
        icon="question",
        action="breath",
        variant="outline-success",
        no-border,
        no-icon-gutter,
        @click="showModalById(modalId)",
        title="說明"
      )
    lah-help-modal(:modal-id="modalId", :modal-title="`${header} 監控說明`")
      ul
        li 顯示資料庫備份狀態(選項2、4、5)
        li 備份選項5更新較頻繁(30mins)，故設定重新整理計時器為30分鐘
      hr
      div 👉🏻 點擊紀錄內容開啟詳細記錄視窗
      div 🟢 表示一切正常
      div 🟡 表示狀態未更新
      div 🔴 表示狀態錯誤
  slot
  .center(v-if="headMessages.length === 0") ⚠ 無資料
  ul(v-else): li(v-for="(item, idx) in headMessages")
    .d-flex.justify-content-between.font-weight-bold
      a.truncate-short(
        href="#",
        @click="popupLogContent(item)",
        title="顯示詳細記錄"
      ) {{ item.subject }}
      lah-fa-icon.small.my-auto.text-nowrap(icon="clock", regular, :title="$utils.tsToAdDateStr(item.timestamp, true)", :variant="isToday(item.timestamp) ? 'success' : 'muted'") {{ displayDatetime(item.timestamp) }}
    .truncate.text-muted.small {{ item.message }}
  template(#footer, v-if="footer"): client-only: .d-flex.justify-content-between.small.text-muted
    lah-countdown-button.border-0(
      size="sm"
      ref="countdown"
      icon="sync-alt"
      action="ld-cycle"
      auto-start
      title="立即重新讀取"
      variant="outline-secondary"
      badge-variant="secondary"
      :milliseconds="reloadMs"
      :disabled="isBusy"
      :busy="isBusy"
      @end="reload"
      @click="reload"
    )
    lah-fa-icon.my-auto.text-nowrap(icon="clock", title="更新時間") {{ updatedTimestamp }}
</template>

<script>
import lahMonitorBoardBase from '~/components/lah-monitor-board-base'
import lahMonitorBoardRaw from '~/components/lah-monitor-board-raw.vue'

export default {
  components: { lahMonitorBoardRaw },
  mixins: [lahMonitorBoardBase],
  props: {
    footer: { type: Boolean, default: false }
  },
  data: () => ({
    header: '資料庫備份排程',
    modalId: 'tmp-id',
    messages: [],
    updatedTimestamp: '',
    reloadMs: 30 * 60 * 60 * 1000
  }),
  computed: {
    headMessages () {
      const opt2 = this.messages.find(item => item.subject.includes('BACKUP OPTION 2'))
      const opt4 = this.messages.find(item => item.subject.includes('BACKUP OPTION 4'))
      const opt5 = this.messages.find(item => item.subject.includes('BACKUP OPTION 5'))
      return [opt2, opt4, opt5].filter(item => item)
    },
    light () {
      const now = +new Date()
      if (this.headMessages.length === 0 || (now - this.headMessages[0].timestamp * 1000) > 24 * 60 * 60 * 1000) {
        return 'warning'
      }
      if (this.headMessages.length !== 3) {
        return 'danger'
      }
      return 'success'
    }
  },
  created () {
    this.modalId = this.$utils.uuid()
    this.reload()
  },
  methods: {
    reload () {
      this.isBusy = true
      this.succeed = 0
      // to update untaken data in sqlite db
      this.$axios
        .post(this.$consts.API.JSON.MONITOR, {
          type: 'subject',
          keyword: 'BACKUP OPTION'
        })
        .then(({ data }) => {
          if (this.$utils.statusCheck(data.status)) {
            this.messages = [...data.raw]
          } else {
            this.warning(data.message)
          }
        })
        .catch((err) => {
          this.alert(err.message)
          this.$utils.error(err)
        })
        .finally(() => {
          this.isBusy = false
          this.updatedTimestamp = this.$utils.now().replace(this.today, '')
          if (this.$refs.countdown) {
            this.$refs.countdown.setCountdown(this.reloadMs)
            this.$refs.countdown.startCountdown()
          } else {
            this.timeout(() => this.reload(), this.reloadMs)
          }
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