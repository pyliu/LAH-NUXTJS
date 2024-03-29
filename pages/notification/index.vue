<template lang="pug">
  div
    lah-header: lah-transition(appear): .d-flex.justify-content-between.w-100
      .d-flex
        .my-auto 公告訊息發布管理
        lah-button(icon="info" action="bounce" variant="outline-success" no-border no-icon-gutter @click="showModalById('help-modal')" title="說明")
        lah-help-modal(:modal-id="'help-modal'"): ol
          li 可先利用送給 #[b-badge.s-105(variant="primary" pill) 我自己] 來做傳送測試
            ul: li 電腦端需安裝 #[b 桃園即時通程式] 並正常連線才能顯示
          li 歷史資料儲存於瀏覽器端，最少顯示 #[b.text-info 3] 筆，最多顯示 #[b.text-info 30] 筆 ({{ memento.length }} / {{ mementoCapacity }})
          li 標題限制最大長度為 #[b.text-info 84] 個英文字元(中文 #[b.text-info 42] 個字)
          li 內容支援 Markdown 語法，請參考 #[a(href="https://markdown.tw/" target="_blank" rel="noopener noreferrer") #[b https://markdown.tw/]] 教學
      .d-flex

    b-card-group(deck)

      b-card(ref="addCard" border-variant="dark")
        template(#header): .d-flex.justify-content-between
          h4.my-auto 新增公告
          b-button-group
            lah-button(icon="paper-plane" :variant="sendButtonDisabled ? 'outline-primary' : 'primary'" :disabled="sendButtonDisabled" @click="add" pill) 送出
            lah-button.mx-1(icon="undo-alt" variant="outline-secondary" title="清除欄位及已選擇對象" @click="reset" action="cycle-alt" pill) 清除
            lah-button(icon="question" variant="outline-success" action="bounce" title="內容 Markdown 語法簡易說明" v-b-toggle.md-desc :pressed="helpSidebarFlag" pill) 說明
        b-form-group.mb-1
          template(#label): .d-flex.align-items-center.h5(@click="flipSendto")
            lah-fa-icon.mr-1(icon="caret-square-right" regular)
            div(:title="validSendto ? '' : '至少選一個對象！'") 發布對象 #[lah-fa-icon.ml-1(:icon="validSendto ? 'check' : 'exclamation-circle'" :variant="validSendto ? 'success' : 'danger'" :action="validSendto ? '' : 'breath'")]
          b-form-checkbox-group(
            v-model="announcementSendto"
            :options="announcementSendtoOpts"
          )
        hr
        .d-flex.mb-1
          b-input-group(size="sm" prepend="　　標題")
            b-input(v-model="announcementDataJson.title" :state="validTitle" placeholder=" ... 必要欄位 ..." v-b-tooltip.focus="`輸入 ${$utils.length(announcementDataJson.title)} / 84 個字元`")
          b-input-group.ml-1.severity(size="sm" prepend="緊急程度")
            b-select(v-model="announcementDataJson.priority" :options="announcementPriorityOpts")
        b-input-group.mb-3(size="sm" prepend="　　內容")
          b-textarea.overflow-auto(
            v-model="announcementDataJson.content"
            rows="5"
            max-rows="15"
            placeholder="... 支援 Markdown 語法 ... "
            :state="validContent"
          )

      lah-transition(appear): b-card(border-variant="success")
        template(#header): .d-flex.align-items-center
          h4.text-nowrap.mr-auto.my-auto 預覽
          div(v-if="sendto.length > 0"): b-badge.mx-1(v-for="(to, idx) in sendto" :variant="sendtoVariant(to)" pill :key="`b-badge-${idx}`")
            strong.s-100 {{ to }}
        lah-notification-announcement-card.mx-auto(
          :data-json="announcementDataJson"
        )

    h4.d-flex.justify-content-between.align-items-stretch.my-3
      lah-fa-icon.my-auto(icon="clipboard-list") 歷史資料
      b-input-group.memento-count-input(prepend="顯示" append="筆"): b-input(type="number" min="3" max="10" v-model="mementoCount")
    hr
    b-card-group(columns): transition-group(name="list" mode="out-in")
      lah-notification-announcement-memento(
        v-for="(snapshot, idx) in memento"
        :key="`hist_${idx}`"
        :memento="snapshot"
        @copy="copy(snapshot)"
        @remove="remove(snapshot)"
        @badge="removeMementoAddedChannel($event.detail, snapshot)"
      )

    b-sidebar(
      id="md-desc"
      v-model="helpSidebarFlag"
      title="簡易排版語法說明"
      right
      shadow
    )
      b-card
        | #[b 標題]#[br]
        | 語法(共支援五層標題)：#[br]
        | #[b.text-primary # 第一標題]#[br]
        | #[b.text-primary ## 第二標題]
        | #[hr]
        | #[b 引言]#[br]
        | 語法：#[i #[b.text-primary > 「我思，故我在。」]]
        | #[hr]
        | #[b 分隔線]#[br]
        | 語法： #[b.text-primary ---]
        | #[hr]
        | #[b 超連結]#[br]
        | 語法：#[br]
        | <b class="text-primary">[知識網](http://220.1.34.18:8888/)</b>
        | #[hr]
        | #[b 編號項目符號]#[br]
        | 語法：#[br]
        | #[b.text-primary -] 康德#[br]
        | #[b.text-primary 1.] 笛卡爾#[br]
        | #[b.text-primary 2.] 蘇格拉底#[br]
        | 可使用「 * 」 取代這裡的「 - 」，或是使用數字加上「 . 」
        | #[hr]
        | #[b 斜體與粗體]#[br]
        | 粗體語法： #[b.text-primary **我是粗體**]#[br]
        | 斜體語法： #[b.text-primary *我是斜體*]#[br]
        | #[hr]
        | 其他詳細 Markdown 語法，請參考 #[a(:href="`${legacyUrl}/markdown.html`", target="_blank") https://markdown.tw/] 教學
</template>

<script>
export default {
  middleware: ['isNotifyMgtStaff'],
  asyncData ({ store, redirect, error }) { return {} },
  data: () => ({
    announcementDataJson: {
      title: '',
      content: `##### **\`我是主題\`**
***一般說明打在這邊....***

[知識網連結](http://220.1.34.18:8888/)
- [ ] 空心菜
- [x] 醬油
  1. 雲林西螺
  2. 屏東東港

<font color=#0000FF>... 可打上其他說明於此 ... (深藍色)</font>
    `,
      priority: 3,
      sender: '',
      id: '?',
      create_datetime: ''
    },
    announcementPriorityOpts: [
      { text: '最高', value: 0 },
      { text: '高', value: 1 },
      { text: '中', value: 2 },
      { text: '正常', value: 3 }
    ],
    announcementSendto: ['myself'],
    announcementSendtoOpts: [
      { value: 'all', text: '全所' },
      // { value: 'supervisor', text: '主任秘書室' },
      // { value: 'hr', text: '人事室' },
      // { value: 'acc', text: '會計室' },
      // { value: 'adm', text: '行政課' },
      // { value: 'reg', text: '登記課' },
      // { value: 'sur', text: '測量課' },
      // { value: 'val', text: '地價課' },
      // { value: 'inf', text: '資訊課' },
      { value: 'myself', text: '我自己' }
    ],
    helpSidebarFlag: false,
    cacheKey: 'postMementoCache',
    memento: [],
    mementoCapacity: 30,
    mementoCount: 3
  }),
  head: {
    title: '公告訊息發布管理'
  },
  computed: {
    validTitle () {
      return !this.$utils.empty(this.announcementDataJson.title) && this.$utils.length(this.announcementDataJson.title) <= 84
    },
    validContent () {
      return !this.$utils.empty(this.announcementDataJson.content)
    },
    validSendto () {
      return this.announcementSendto.length > 0
    },
    sendButtonDisabled () {
      return !this.validContent || !this.validTitle || !this.validSendto
    },
    sendto () {
      const sendto = []
      this.announcementSendto.forEach((selected) => {
        const found = this.announcementSendtoOpts.find((item) => {
          return item.value === selected
        })
        found && sendto.push(found.text)
      })
      return sendto
    },
    mementoCountCacheKey () {
      return `${this.cacheKey} count`
    },
    reverseMemento () {
      return this.memento.slice().reverse().slice(0, this.mementoCount)
    },
    firstColumnMemento () {
      return this.reverseMemento.filter((snap, idx) => {
        return idx % 3 === 0
      })
    },
    secondColumnMemento () {
      return this.reverseMemento.filter((snap, idx) => {
        return idx % 3 === 1
      })
    },
    thirdColumnMemento () {
      return this.reverseMemento.filter((snap, idx) => {
        return idx % 3 === 2
      })
    },
    myLabelText () { return `${this.myname} (${this.myid})` }
  },
  watch: {
    mementoCount (val) {
      this.setCache(this.mementoCountCacheKey, val)
      this.restoreCachedMemento()
    },
    myid (id) {
      this.announcementDataJson.sender = id
    },
    myname (dontcare) {
      const myself = this.announcementSendtoOpts.find((item) => {
        return item.value === 'myself'
      })
      myself.text = this.myLabelText
    }
  },
  async mounted () {
    this.mementoCount = await this.getCache(this.mementoCountCacheKey) || 3
    this.restoreCachedMemento()
    this.announcementDataJson.create_datetime = this.currentDatetime()
    // init my info to relative fields
    this.announcementDataJson.sender = this.myid
    const myself = this.announcementSendtoOpts.find((item) => {
      return item.value === 'myself'
    })
    myself.text = this.$utils.empty(this.myname) ? '我自己' : this.myLabelText
  },
  methods: {
    async restoreCachedMemento () {
      const cached = await this.getCache(this.cacheKey)
      cached && (this.memento = [...cached])
      if (this.memento.length > this.mementoCount) {
        this.memento.splice(0, this.memento.length - this.mementoCount)
      }
    },
    addMemento (snapshot) {
      this.memento.push(snapshot)
      if (this.memento.length > this.mementoCapacity) {
        this.memento.splice(0, 1)
      }
      this.setCache(this.cacheKey, this.memento)
    },
    currentDatetime () {
      const m = new Date()
      return m.getFullYear() + '-' + (m.getMonth() + 1).toString().padStart(2, '0') + '-' + m.getDate().toString().padStart(2, '0') + ' ' + m.getHours().toString().padStart(2, '0') + ':' + m.getMinutes().toString().padStart(2, '0') + ':' + m.getSeconds().toString().padStart(2, '0')
    },
    copy (snapshot) {
      this.announcementSendto = [...snapshot.channels]
      this.announcementDataJson = { ...this.announcementDataJson, ...snapshot }
      // remove additional property
      delete this.announcementDataJson.channels
      this.$refs.addCard.scrollIntoView()
      setTimeout(() => this.attention(this.$refs.addCard), 400)
    },
    remove (snapshot) {
      this.confirm(`移除「${snapshot.title}」這筆歷史紀錄?`).then((YN) => {
        if (YN) {
          // request to remove content from all added channels
          if (Array.isArray(snapshot.added_to)) {
            const channelData = snapshot.added_to.map((added, idx, array) => {
              return {
                channel: added.channel,
                id: added.addedId
              }
            })
            this.requestDBRemove(channelData, () => {
              for (let i = 0; i < this.memento.length; i++) {
                if (this.$utils.equal(this.memento[i], snapshot)) {
                  this.copy(this.memento[i])
                  this.memento.splice(i, 1)
                  this.setCache(this.cacheKey, this.memento)
                  return
                }
              }
            })
          } else {
            this.warning('這個 snapshot 裡沒有 added_to 屬性資料。')
          }
        }
      })
    },
    removeMementoAddedChannel (added, snapshot) {
      // request to remove content from a specified channel
      this.requestDBRemove([{
        channel: added.channel,
        id: added.addedId
      }], () => {
        // remove the content of specified channel in memento
        for (let i = 0; i < snapshot.added_to.length; i++) {
          if (this.$utils.equal(snapshot.added_to[i], added)) {
            snapshot.added_to.splice(i, 1)
            this.setCache(this.cacheKey, this.memento)
            break
          }
        }
      })
    },
    requestDBRemove (array, cb = undefined) {
      if (Array.isArray(array)) {
        this.isBusy = true
        this.$axios.post(this.$consts.API.JSON.NOTIFICATION, {
          type: 'remove_notification',
          message_type: 'announcement',
          channels: array
        }).then(({ data }) => {
          this.notify(data.message, { type: data.status > 0 ? 'success' : 'warning' })
          data.status > 0 && cb && cb()
        }).catch((err) => {
          this.alert(err.message)
          this.$utils.error(err)
        }).finally(() => {
          this.isBusy = false
        })
      } else {
        this.alert('欲刪除之頻道資訊不是陣列')
        this.$utils.warn(array)
      }
    },
    add () {
      this.confirm('確定要新增公告?').then((flag) => {
        if (flag) {
          this.isBusy = true
          const snapshot = {
            channels: this.announcementSendto,
            from_ip: this.ip,
            title: this.announcementDataJson.title,
            content: this.announcementDataJson.content,
            priority: this.announcementDataJson.priority,
            sender: this.user.id || this.ip,
            create_datetime: this.currentDatetime()
          }
          this.$axios.post(this.$consts.API.JSON.NOTIFICATION, {
            type: 'add_notification',
            ...snapshot
          }).then(({ data }) => {
            this.notify(data.message, { type: data.status > 0 ? 'success' : 'warning', title: data.title })
            if (data.status > 0) {
              snapshot.added_to = data.added
            }
          }).catch((err) => {
            this.alert(err.message)
            this.$utils.error(err)
          }).finally(() => {
            this.isBusy = false
            this.addMemento(snapshot)
            this.reset()
          })
        }
      })
    },
    reset () {
      this.announcementDataJson = {
        ...{
          title: '',
          content: '',
          priority: 3,
          sender: '',
          id: '?',
          create_datetime: this.currentDatetime()
        }
      }
      this.announcementSendto = []
    },
    flipSendto () {
      if (this.$utils.empty(this.announcementSendto)) {
        this.announcementSendto = [...['myself']]
      } else {
        this.announcementSendto = []
      }
    },
    sendtoVariant (to) {
      switch (to) {
        case '全所':
          return 'danger'
        case '我自己':
        case this.myLabelText:
          return 'primary'
        default:
          return 'success'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.severity {
  max-width: 150px;
}
.memento-count-input {
  max-width: 160px;
}
</style>
