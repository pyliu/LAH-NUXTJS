<template>
  <div>
    <lah-header>
      <lah-transition appear>
        <div class="d-flex justify-content-between w-100">
          <lah-fa-icon icon="calculator" variant="secondary" append class="my-auto">統計看板</lah-fa-icon>
          <div class="d-flex">
            <lah-button
              icon="sync"
              action="cycle"
              no-border
              @click="refresh"
              variant="outline-primary"
              title="重新擷取統計資料"
            />
            <b-input-group :prepend="dateLabel" class="mx-1">
              <b-form-input
                v-model="rangeValue"
                type="range"
                :min="1"
                :max="rangeMax"
                class="h-100"
              />
            </b-input-group>
            <b-input-group prepend="關鍵字">
              <b-form-input
                type="text"
                v-model="keyword"
                class="h-100"
              />
            </b-input-group>
          </div>
        </div>
      </lah-transition>
    </lah-header>
    <div class="container">
      <div>
        <lah-logo class="anim-appear-2s" />
        <h3 class="title">樣板</h3>
        <div>some text goes here ...</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  head: {
    title: "案件統計看板-桃園市地政局",
  },
  data: () => {
    const now = new Date()
    const defYear = now.getFullYear() - 1911
    const defMonth = now.getMonth() // set last month as default
    return {
      year: defYear,
      month: defMonth,
      base: defYear * 12 + now.getMonth() + 1,
      range: 23,
      rangeMax: 24,
      rangeValue: `${defYear}${defMonth}`,
      keyword: "",
    }
  },
  computed: {
    dateLabel() {
      return `${this.year}-${("0" + this.month).slice(-2)}`
    },
  },
  watch: {
    rangeValue(val) {
      const after = this.base - this.rangeMax + parseInt(val) - 1
      this.year = parseInt(after / 12)
      this.month = (after % 12) + 1
    },
  },
  methods: {
    refresh() {
      this.$confirm(`確定要清除 ${this.date} 已快取資料?`, () => {
        this.isBusy = true
        this.$http
          .post(CONFIG.API.JSON.STATS, {
            type: "stats_refresh_month",
            date: this.date,
          })
          .then(({ data }) => {
            let ok = data.status > 0
            let msg =
              data.message + " " + this.responseMessage(data.status)
            this.notify({
              message: msg,
              type: ok ? "success" : "danger",
            })
            if (ok) this.reload()
          })
          .catch((err) => {
            this.error = err
          })
          .finally(() => {
            this.isBusy = false
          })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
