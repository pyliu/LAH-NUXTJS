<template lang="pug">
b-card(
  :class="noBorder ? ['border-0'] : []"
  no-body
)
  .d-flex.justify-content-center: lah-button.my-1(
    icon="download",
    title="點我下載EXCEL檔案",
    size="lg",
    action="slide-ttb",
    @click="download",
    :variant="done ? 'success' : 'outline-secondary'",
    :disabled="!done"
  ) 開始下載
  lah-fa-icon(icon="list-alt", variant="secondary") 處理紀錄
  b-list-group(flush): b-list-group-item(v-for="(msg, idx) in messages" :key="`${idx}_msg`")
    lah-fa-icon(
      v-if="idx === 0"
      icon="angle-double-right",
      variant="danger",
      action="move-fade-ltr"
    )
    span.ml-1 {{ msg }}
</template>

<script>
import FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import Workbook from './lah-xlsx-download-workbook.js'
export default {
  name: 'LahXlsxDownload',
  props: {
    header: { type: String, default: '' },
    filename: { type: String, default: '' },
    jsonArray: { type: Array, default: () => [] },
    type: { type: String, default: '' },
    params: { type: Object, default: () => ({}) },
    noBorder: { type: Boolean, default: true }
  },
  data: () => ({
    workbook: null,
    messages: [],
    done: false
  }),
  computed: {
    sheet () {
      this.addMessage('轉換表格資料中 ... ')
      return XLSX.utils.json_to_sheet(this.jsonArray)
    }
  },
  watch: {
    jsonArray (val) {
      this.addMessage(`查到 ${val.length} 筆資料。`)
      this.done = !this.$utils.empty(val)
    }
  },
  created () { },
  mounted () {
    if (!this.$utils.empty(this.header)) {
      this.addMessage(`準備 ${this.header} 資料轉換 ... `)
    }
    if (!this.$utils.empty(this.jsonArray)) {
      this.addMessage(`查到 ${this.jsonArray.length} 筆資料。`)
      this.done = !this.$utils.empty(this.jsonArray)
    }
  },
  methods: {
    addMessage (msg) {
      this.messages.unshift(`${msg} (${this.$utils.time()})`)
    },
    download () {
      if (this.done) {
        if (!this.workbook) {
          this.workbook = new Workbook()
        }
        this.addMessage('將轉換的資料加到 Workbook 中 ...')
        this.workbook.appendSheet(this.sheet)

        // const tables = document.getElementsByTagName('table')
        // for (let i = 0; i < tables.length; ++i) {
        //   const ws = XLSX.utils.table_to_sheet(tables[i])
        //   this.workbook.appendSheet(ws, 'Table' + i)
        // }

        const filename = this.$utils.empty(this.filename) ? this.$utils.twDateStr(new Date(), true) : this.filename
        this.addMessage(`準備 ${filename}.xlsx ...`)
        FileSaver.saveAs(this.workbook.toBlob(), `${filename}.xlsx`)
        this.addMessage(`${filename}.xlsx 已開始下載請查看瀏覽器下載清單。`)
        this.done = false
      } else {
        this.addMessage('⚠ 無資料 ... 請稍後再試！')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
