<template>
  <div>
    <b-table
      ref="tbl"
      
      striped
      hover
      responsive
      bordered
      caption-top
      no-border-collapse
      small
      head-variant="dark"
      class="text-center s-90"
      selectable
      select-mode="single"
      selected-variant="success"

      :items="tableItems"
      :fields="fields"
      :busy="isBusy || busy"
      :sticky-header="`${this.maxHeight}px`"
    >
      <template v-slot:table-busy>
        <div class="text-center text-danger my-5">
          <strong class="ld-txt">查詢中...</strong>
        </div>
      </template>
      <template v-slot:cell(序號)="data">
        <template v-if="data.rowSelected">
          <span aria-hidden="true">&check;</span>
          <span class="sr-only">Selected</span>
        </template>
        <template v-else>
          <span aria-hidden="true">&nbsp;</span>
          <span class="sr-only">Not selected</span>
        </template>
        {{ data.index + 1 }}
      </template>
      <template v-slot:cell(收件字號)="data">
        <NuxtLink :to="`/regcase/${data.value}`">{{ data.value }}</NuxtLink>
        <b-link @click="popup(data)"><lah-fa-icon icon="window-restore" regular /></b-link>
      </template>
      <template v-slot:cell(初審人員)="data">
        <b-button
          v-if="allCaseMode"
          :variant="buttoVariant"
          size="sm"
          @click="$router.push(`/expire/${data.value}`)"
          :title="buttonReviewerTitle(data.value)"
          pill
        >
          <lah-avatar :id="data.value.split(' ')[0]" :name="data.value.split(' ')[1]">
            {{ data.value.split(' ')[0] }}
          </lah-avatar>
        </b-button>
        <b-button
          v-else
          variant="outline-secondary"
          @click="searchUser(data.value.split(' ')[0], data.value.split(' ')[1])"
          size="sm"
          :title="`查詢 ${data.value} 的使用者訊息`"
          pill
          >
            <lah-avatar :id="data.value.split(' ')[0]" :name="data.value.split(' ')[1]">
              {{ data.value.split(' ')[0] }}
            </lah-avatar>
          </b-button>
      </template>
      <template v-slot:cell(作業人員)="data">
        <b-button
          :data-name="data.value"
          :data-id="data.value"
          variant="outline-secondary"
          @click="searchUser(data.value)"
          size="sm"
          :title="`查詢 ${data.value} 的使用者訊息`"
          pill
        >
          <lah-avatar :name="data.value">
            {{ data.value }}
          </lah-avatar>
        </b-button>
      </template>
    </b-table>
    <b-modal
      :id="modalId"
      hide-footer
      centered
      no-close-on-backdrop
      size="xl"
      scrollable
    >
      <template #modal-title>
        登記案件詳情 {{clickedId}}
      </template>
      <h4 class="text-center text-info my-5" v-if="modalLoading">
        <b-spinner small type="grow"></b-spinner>
        <strong class="ld-txt">查詢中...</strong>
      </h4>
      <lah-reg-case-detail v-show="!modalLoading" @ready="modalLoading = !$event.detail" :case-id="clickedId"/>
    </b-modal>
  </div>
</template>

<script>
import lahUserCard from '~/components/lah-user-card.vue'
export default {
  name: 'lah-expiry-b-table',
  components: { lahUserCard },
  props: {
    reviewerId: { type: String, default: '' },
    busy: { type: Boolean, default: false },
    maxHeightOffset: { type: Number, default: 105 }
  },
  data: () => ({
    fields: [
      "序號",
      { key: "收件字號", sortable: true },
      { key: "登記原因", sortable: true },
      { key: "辦理情形", sortable: true },
      { key: "初審人員", sortable: true },
      { key: "作業人員", sortable: true },
      { key: "收件時間", sortable: true },
      { key: "限辦期限", sortable: true }
    ],
    modalId: 'this should be an uuid',
    clickedId: undefined,
    modalLoading: true,
    maxHeight: 600
  }),
  computed: {
    totalCase () {
      return this.$store.getters["expiry/list_count"]
    },
    totalPeople () {
      return this.$store.getters["expiry/list_by_id_count"]
    },
    caseList () {
      return this.$store.getters["expiry/list"]
    },
    caseListByID () {
      return this.$store.getters["expiry/list_by_id"]
    },
    reviewerCaseList () {
      return this.caseListByID[this.reviewerId]
    },
    isOverdueMode () {
      return this.$store.getters["expiry/is_overdue_mode"]
    },
    tableItems () {
      return this.allCaseMode ? this.caseList : this.caseListByID[this.reviewerId]
    },
    count () { return this.tableItems ? this.tableItems.length : 0 },
    buttoVariant () { return this.isOverdueMode ? 'outline-danger' : 'warning' },
    allCaseMode () { return this.$utils.empty(this.reviewerId) },
    maxHeightStyle () { return `max-height: ${this.maxHeight}px` }
  },
  watch: {
    totalPeople (val) {
      val > 0 && this.allCaseMode && this.notify({
        title: this.isOverdueMode ? '已逾期案件' : '快逾期案件',
        message: `找到 ${val} 位相關人員案件`,
        type: this.isOverdueMode ? 'danger' : 'warning'
      })
    },
    totalCase (val) {
      val > 0 && this.allCaseMode && this.notify({
        title:  this.isOverdueMode ? '已逾期案件' : '快逾期案件',
        message: `共有 ${val} 件案件`,
        type: this.isOverdueMode ? 'danger' : 'warning'
      })
    },
    reviewerCaseList (val) {
      val > 0 && !this.allCaseMode && this.notify({
        title:  this.isOverdueMode ? '已逾期案件' : '快逾期案件',
        subtitle: this.reviewerId,
        message: `找到 ${val.length} 件案件`,
        type: this.isOverdueMode ? 'danger' : 'warning'
      })
    }
  },
  methods: {
    popup (data) {
      this.modalLoading = true
      this.clickedId = data.value.replace(/^[a-zA-Z0-9]$/g, '')
      this.showModalById(this.modalId)
    },
    buttonReviewerTitle (id) { return `查詢 ${id} 的${this.isOverdueMode ? '逾期' : '即將逾期'}案件` },
    searchByReviewer (id) {},
    searchUser (name, id = '') {
      this.modal(this.$createElement('lah-user-card', {
        props: { name: name, id: id }
      }), {
        title: `${id} ${name} 資訊`
      })
    }
  },
  created () { this.modalId = this.$utils.uuid() },
  mounted () {
    this.maxHeight = parseInt(window.innerHeight - this.maxHeightOffset)
  }
}
</script>

<style lang="scss" scoped>
</style>
