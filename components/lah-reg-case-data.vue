<template>
  <b-card>
    <b-card-title v-if="!noTitle">
      收件資料 <b-link :href="queryDataUrl" target="_blank" title="開啟新視窗"><lah-fa-icon icon="share-square" no-gutter></lah-fa-icon></b-link>
    </b-card-title>
    <b-list-group flush compact v-if="ready">
      <b-list-group-item v-if="bakedData.跨所 == 'Y'">
        <span class="bg-info text-white rounded p-1"
          >跨所案件 ({{ bakedData.資料收件所 }} =>
          {{ bakedData.資料管轄所 }})</span
        >
      </b-list-group-item>
      <b-list-group-item>
        收件字號：
        <a
          :title="'收件資料 on ' + webapIp"
          href="javascript:void(0)"
          @click="$utils.openNewWindow(queryDataUrl, $event)"
        >
          {{ bakedData.收件字號 }}
        </a>
      </b-list-group-item>
      <b-list-group-item>
        收件時間：{{ bakedData.收件時間 }}
      </b-list-group-item>
      <b-list-group-item>
        測量案件：{{ bakedData.測量案件 }}
      </b-list-group-item>
      <b-list-group-item>
        限辦期限：<span v-html="bakedData.限辦期限"></span>
      </b-list-group-item>
      <b-list-group-item>
        作業人員：
        <b-button pill variant="outline-secondary" size="sm" @click="userinfo(bakedData.作業人員, bakedData.RM30_1)">
          <lah-avatar :id="bakedData.RM30_1" :name="bakedData.作業人員">
            {{ bakedData.作業人員 }}
          </lah-avatar>
        </b-button>
      </b-list-group-item>
      <b-list-group-item>
        辦理情形：{{ bakedData.辦理情形 }}
      </b-list-group-item>
      <b-list-group-item>
        登記原因：{{ bakedData.登記原因 }}
      </b-list-group-item>
      <b-list-group-item>
        區域：{{ bakedData.區名稱 }}【{{ bakedData.RM10 }}】
      </b-list-group-item>
      <b-list-group-item>
        段小段：{{ bakedData.段小段 }}【{{ bakedData.段代碼 }}】
      </b-list-group-item>
      <b-list-group-item> 地號：{{ bakedData.地號 }} </b-list-group-item>
      <b-list-group-item> 建號：{{ bakedData.建號 }} </b-list-group-item>
      <b-list-group-item> 件數：{{ bakedData.件數 }} </b-list-group-item>
      <b-list-group-item>
        登記處理註記：{{ bakedData.登記處理註記 }}
      </b-list-group-item>
      <b-list-group-item>
        地價處理註記：{{ bakedData.地價處理註記 }}
      </b-list-group-item>
      <b-list-group-item>
        手機號碼：{{ bakedData.手機號碼 }}
      </b-list-group-item>
    </b-list-group>
  </b-card>
</template>

<script>
import regCaseBase from "~/assets/js/reg-case-base.js"
import lahUserCard from '~/components/lah-user-card.vue'
import lahAvatar from '~/components/lah-avatar.vue'
export default {
  name: 'lah-reg-case-data',
  components: { lahUserCard, lahAvatar },
  mixins: [regCaseBase],
  props: {
    noTitle: { type: Boolean, default: false }
  },
  methods: {
    userinfo (name, id = '') {
      this.modal(this.$createElement('lah-user-card', { props: { name: name, id: id } }), {
        title: `${id} ${name} 資訊`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
