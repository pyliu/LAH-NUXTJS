<template lang="pug">
  div
    lah-header
      lah-transition(appear): .d-flex.justify-content-between.w-100
        .d-flex
          .my-auto 非專業代理人案件檢索
          lah-button(icon="question" action="bounce" variant="outline-success" no-border no-icon-gutter @click="showModalById('help-modal')" title="說明")
          lah-help-modal(:modal-id="'help-modal'")
            h5 請參照下列步驟搜尋
            ol
              li 切換登記或測量案件
              li 選擇日期區間(預設為目前月份)
              li 輸入想要忽略之統編(非必要)
              li 點擊 #[lah-fa-icon(icon="search" variant="primary" no-gutter)] 搜尋
        
        .d-flex
          b-form-radio-group.d-flex.text-nowrap.my-auto.small(
            v-model="caseType"
            :options="caseTypeOpts"
          )
          b-datepicker(
            v-model="startDateObj"
            placeholder="開始日期"
            boundary="viewport"
            size="sm"
            :date-format-options="{ weekday: 'narrow' }"
            :max="yesterday"
            value-as-date
            hide-header
            dropleft
          )
          .my-auto ～
          b-datepicker.mr-1(
            v-model="endDateObj"
            placeholder="截止日期"
            boundary="viewport"
            size="sm"
            :date-format-options="{ weekday: 'narrow' }"
            :max="today"
            :min="startDateObj"
            hide-header
            dark
            value-as-date
          )
          lah-button.mr-1(
            icon="search"
            size="lg"
            title="搜尋"
            @click="$fetch"
            :disabled="isBusy"
            :busy="isBusy"
            no-icon-gutter
          )
          lah-countdown-button(
            ref="countdown"
            icon="sync-alt"
            action="ld-cycle"
            size="lg"
            variant="outline-secondary"
            badge-variant="secondary"
            title="強制重新搜尋"
            :milliseconds="0"
            :disabled="isBusy"
            :busy="isBusy"
            @end="reload"
            @click="reload"
            no-badge
          )
    .d-flex.justify-content-between.mb-1
      b-pagination(
        v-if="showPagination"
        v-model="currentPage"
        :total-rows="paginationCount"
        :per-page="perPage"
        last-number
        first-number
        aria-controls="scrivener-table"
        class="my-auto mr-2"
      )
      b-input-group(size="sm" prepend="忽略" class="tags-input")
        b-form-tags(
          input-id="tags"
          v-model="ignoreTags"
          separator=" ,;"
          remove-on-delete
          tag-variant="secondary"
          tag-pills
          placeholder="忽略的統編 ... "
          add-button-text="新增"
          add-button-variant="outline-secondary"
        )
        b-input-group-append
          lah-button(prefix="far" action="move-fade-rtl" icon="hand-point-left" variant="outline-secondary" @click="ignoreTyoffices" title="桃園市") 各事務所
          lah-button(action="swing" icon="broom" variant="outline-success" @click="ignoreTags = []" title="清除忽略標籤") 清除
    lah-transition
      div(v-if="committed")
        lah-reg-b-table(
          :busy="isBusy"
          :baked-data="regBakedData"
          :fields="regFields"
          :per-page="perPage"
          :current-page="currentPage"
          :caption-append="captionRange"
          :max-height-offset="160"
          only-popup-detailed
          v-if="caseType === 'reg'"
        )
        lah-reg-b-table(
          v-else
          :busy="isBusy"
          :baked-data="surBakedData"
          :fields="surFields"
          :per-page="perPage"
          :current-page="currentPage"
          :caption-append="captionRange"
          :max-height-offset="160"
          only-popup-detailed
        )
      h3(v-else class="text-center"): lah-fa-icon(icon="search" action="breath" variant="primary") 請點擊查詢按鈕
</template>

<script>
export default {
  head: {
    title: "信託案件檢索-桃園市地政局",
  },
  fetchOnServer: false,
  data: () => ({
    clickedId: undefined,
    forceReload: false,
    committed: false,
    tyOfficeMap: {
      '中壢': 45000808,
      '楊梅':	43717356,
      '桃園': 43504044,
      '大溪': 43501004,
      '蘆竹':	44039876,
      '八德':	95924138,
      '平鎮':	95920288,
      '龜山': 50634177

    },
    ignoreTags: ['中壢', '楊梅', '桃園', '大溪', '蘆竹', '八德', '平鎮', '龜山'],
    regBakedData: [],
    regFields: [
      {
        key: "收件字號",
        sortable: true
      },
      {
        key: "收件日期",
        sortable: true
      },
      {
        key: "登記原因",
        sortable: true
      },
      {
        key: "AB01",
        label: "非專代統編",
        sortable: true
      },
      {
        key: "AB02",
        label: "非專代名稱",
        sortable: true
      },
      {
        key: "AB03",
        label: "非專代住址",
        sortable: true
      },
      {
        key: "AB04_NON_SCRIVENER_TEL",
        label: "非專代電話",
        sortable: true
      },
      {
        key: "AB13",
        label: "當年案件量",
        sortable: true
      },
      {
        key: "AB23",
        label: "本所案件量",
        sortable: true
      },
      {
        key: "權利人姓名",
        sortable: true
      },
      {
        key: "權利人住址",
        sortable: true
      },
      {
        key: "義務人姓名",
        sortable: true
      },
      {
        key: "義務人住址",
        sortable: true
      },
      {
        key: "區名稱",
        sortable: true
      },
      {
        key: "段小段",
        sortable: true
      },
      {
        key: "RM12_C",
        label: "地號",
        sortable: true
      },
      {
        key: "RM15_C",
        label: "建號",
        sortable: true
      }
    ],
    currentPage: 1,
    perPage: 25,
    caseType: 'reg',
    caseTypeOpts: [
      { text: '登記', value: 'reg' },
      { text: '測量', value: 'sur' }
    ],
    surBakedData: [],
    surFields: [
      {
        key: "MM123",
        label: '收件字號',
        sortable: true
      },
      {
        key: "收件日期",
        sortable: true
      },
      {
        key: "申請事由",
        sortable: true
      },
      {
        key: "AB01",
        label: "非專代統編",
        sortable: true
      },
      {
        key: "AB02",
        label: "非專代名稱",
        sortable: true
      },
      {
        key: "AB03",
        label: "非專代住址",
        sortable: true
      },
      {
        key: "AB04_NON_SCRIVENER_TEL",
        label: "非專代電話",
        sortable: true
      },
      {
        key: "AB13",
        label: "當年案件量",
        sortable: true
      },
      {
        key: "AB23",
        label: "本所案件量",
        sortable: true
      },
      {
        key: 'MM13',
        label: "申請人統編",
        sortable: true
      },
      {
        key: 'MM14',
        label: "申請人姓名",
        sortable: true
      },
      {
        key: 'MM15',
        label: "申請人電話",
        sortable: true
      },
      {
        key: 'MM16',
        label: "申請人住址",
        sortable: true
      },
      {
        key: 'RM10_C_KCNT',
        label: "區名稱",
        sortable: true
      },
      {
        key: 'RM11_C_KCNT',
        label: "段小段",
        sortable: true
      },
      {
        key: "RM12_C",
        label: "地號",
        sortable: true
      },
      {
        key: "RM15_C",
        label: "建號",
        sortable: true
      }
    ]
  }),
  async asyncData(nuxt) {
    const today = new Date()
    const yesterday = new Date(new Date().setDate(new Date().getDate()-1))
    const firstDayofMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayofMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return {
      startDate: `${firstDayofMonth.getFullYear() - 1911}${("0" + (firstDayofMonth.getMonth()+1)).slice(-2)}${("0" + firstDayofMonth.getDate()).slice(-2)}`,
      endDate: `${lastDayofMonth.getFullYear() - 1911}${("0" + (lastDayofMonth.getMonth()+1)).slice(-2)}${("0" + lastDayofMonth.getDate()).slice(-2)}`,
      firstDayofMonth,
      lastDayofMonth,
      today,
      yesterday
    }
  },
  computed: {
    md5Hash () {
      return this.$utils.md5(`${this.startDate}_${this.endDate}_${this.ignoreTags.join('')}`)
    },
    cacheKey () {
      const key = this.caseType === 'reg' ? `non_scrivener_reg_case_${this.md5Hash}` : `non_scrivener_sur_case_${this.md5Hash}`
      return key
    },
    captionRange () {
      return `【${this.startDate.substring(0, 3)}-${this.startDate.substring(3, 5)}-${this.startDate.substring(5)} ~ ${this.endDate.substring(0, 3)}-${this.endDate.substring(3, 5)}-${this.endDate.substring(5)}】`
    },
    fetchType () { return this.caseType === 'reg' ? `reg_non_scrivener_reg_case` : `reg_non_scrivener_sur_case` },
    showPagination () {
      if (this.caseType === 'reg') {
        return !this.$utils.empty(this.regBakedData) && this.regBakedData.length > this.perPage
      }
      return !this.$utils.empty(this.surBakedData) && this.surBakedData.length > this.perPage
    },
    paginationCount () {
      if (this.caseType === 'reg') {
        return this.regBakedData.length
      }
      return this.surBakedData.length
    }
  },
  watch: {
    startDateObj (val) {
      this.startDate = `${val.getFullYear() - 1911}${("0" + (val.getMonth()+1)).slice(-2)}${("0" + val.getDate()).slice(-2)}`
    },
    endDateObj (val) {
      this.endDate = `${val.getFullYear() - 1911}${("0" + (val.getMonth()+1)).slice(-2)}${("0" + val.getDate()).slice(-2)}`
    },
    caseType (val) {
      this.$fetch()
    }
  },
  methods: {
    reload () {
      this.forceReload = true
      this.$fetch()
    },
    resetCommitted () {
      this.committed = false
      this.regBakedData = []
      this.surBakedData = []
      this.currentPage = 1
    },
    doneCommitted () {
      this.isBusy = false
      this.forceReload = false
      this.committed = true
    },
    ignoreTyoffices () {
      this.ignoreTags = ['中壢', '楊梅', '桃園', '大溪', '蘆竹', '八德', '平鎮', '龜山']
    },
    loadReg () {
      // restore cached data if found
      this.getCache(this.cacheKey).then(json => {
        if (this.forceReload || json === false) {
          if(this.isBusy) {
            this.notify('讀取中 ... 請稍後再試', { type: 'warning' })
          } else {
            this.isBusy = true
            this.$axios.post(this.$consts.API.JSON.PREFETCH, {
              type: 'reg_non_scrivener_reg_case',
              start_date: this.startDate,
              end_date: this.endDate,
              reload: this.forceReload,
              ignore: this.ignoreTags.map(tag => this.tyOfficeMap[tag] ? this.tyOfficeMap[tag] : tag)
            }).then(({ data }) => {
              this.regBakedData = data.baked || []
              this.notify(data.message, { type: this.$utils.statusCheck(data.status) ? 'info' : 'warning' })
              const remain_s = data.cache_remaining_time // in seconds
              const remain_ms = remain_s * 1000
              if (remain_ms && remain_ms > 0) {
                this.setCache(this.cacheKey, data, remain_ms)
                if (this.$refs.countdown) {
                  this.$refs.countdown.setCountdown(remain_ms)
                  this.$refs.countdown.startCountdown()
                }
              }
            }).catch(err => {
              this.alert(err.message)
              this.$utils.error(err)
            }).finally(() => {
              this.doneCommitted()
            })
          }
        } else {
          this.regBakedData = json.baked
          this.doneCommitted()
          this.getCacheExpireRemainingTime(this.cacheKey).then(remaining => {
            this.notify(`查詢成功，找到 ${this.regBakedData.length} 筆非專業代理人登記案件。`, { subtitle: `(快取) ${this.$utils.msToHuman(remaining)} 後更新` })
            if (this.$refs.countdown) {
              this.$refs.countdown.setCountdown(remaining)
              this.$refs.countdown.startCountdown()
            }
          })
        }
      })
    },
    loadSur () {
      // restore cached data if found
      this.getCache(this.cacheKey).then(json => {
        if (this.forceReload || json === false) {
          if(this.isBusy) {
            this.notify('讀取中 ... 請稍後再試', { type: 'warning' })
          } else {
            this.isBusy = true
            this.$axios.post(this.$consts.API.JSON.PREFETCH, {
              type: 'reg_non_scrivener_sur_case',
              start_date: this.startDate,
              end_date: this.endDate,
              reload: this.forceReload,
              ignore: this.ignoreTags.map(tag => this.tyOfficeMap[tag] ? this.tyOfficeMap[tag] : tag)
            }).then(({ data }) => {
              this.surBakedData = data.baked || []
              this.notify(data.message, { type: this.$utils.statusCheck(data.status) ? 'info' : 'warning' })
              const remain_s = data.cache_remaining_time // in seconds
              const remain_ms = remain_s * 1000
              if (remain_ms && remain_ms > 0) {
                this.setCache(this.cacheKey, data, remain_ms)
                if (this.$refs.countdown) {
                  this.$refs.countdown.setCountdown(remain_ms)
                  this.$refs.countdown.startCountdown()
                }
              }
            }).catch(err => {
              this.alert(err.message)
              this.$utils.error(err)
            }).finally(() => {
              this.doneCommitted()
            })
          }
        } else {
          this.surBakedData = json.baked
          this.doneCommitted()
          this.getCacheExpireRemainingTime(this.cacheKey).then(remaining => {
            this.notify(`查詢成功，找到 ${this.surBakedData.length} 筆非專業代理人測量案件。`, { subtitle: `(快取) ${this.$utils.msToHuman(remaining)} 後更新` })
            if (this.$refs.countdown) {
              this.$refs.countdown.setCountdown(remaining)
              this.$refs.countdown.startCountdown()
            }
          })
        }
      })
    }
  },
  fetch () {
    this.resetCommitted()
    this.caseType === 'reg' ? this.loadReg() : this.loadSur()
  },
  created () {
    this.startDateObj = this.firstDayofMonth
    this.endDateObj = this.lastDayofMonth
  }
}
</script>

<style lang="scss" scoped>
.move-table-up {
  margin-top: -25px;
}
.fixed-height-table {
  max-height: calc(100% - 135px);
}
.tags-input {
  width: 100vw;
}
</style>
