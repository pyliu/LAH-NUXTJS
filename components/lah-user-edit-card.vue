<template lang="pug">
  b-card(v-if="found && isAuthorized" body-border-variant="danger")
    b-card-group(deck)
      b-card.border-0(no-body): b-form-group(
        label="帳號"
        label-for="id-input"
        label-cols-sm="2"
        label-size="md"
      ): b-input(
        id="id-input"
        v-model="userData['id']"
        :formatter="formatter"
        disabled
        trim
      )
      b-card.border-0(no-body)
        b-form-group(
          label="權限"
          label-for="ext-input"
          label-cols-sm="2"
          label-size="md"
        ): b-checkbox-group(
        v-model="authorities"
        :options="authOpts"
      )

    b-card-group(deck)
      b-card.border-0(no-body): b-form-group(
        label="姓名"
        label-for="name-input"
        label-cols-sm="2"
        label-size="md"
      ): b-input(
        id="name-input"
        v-model="userData['name']"
        :state="checkName"
        :disabled="isDisabled"
        trim
      )
      b-card.border-0(no-body): b-form-group(
        label="電腦"
        label-for="ip-input"
        label-cols-sm="2"
        label-size="md"
      ): b-input(
        id="ip-input"
        v-model="userData['ip']"
        :state="checkIp"
        :disabled="isDisabled"
        trim
      )

    b-card-group(deck)
      b-card.border-0(no-body)
        b-form-group(
          label="性別"
          label-for="sex-select"
          label-cols-sm="2"
          label-size="md"
        ): b-select(
          id="sex-select"
          v-model="userData['sex']"
          :options="sexOpts"
          :disabled="isDisabled"
        )
      b-card.border-0(no-body)
        b-form-group(
          label="課室"
          label-for="unit-select"
          label-cols-sm="2"
          label-size="md"
        ): b-select(
          id="unit-select"
          v-model="userData['unit']"
          :options="unitOpts"
          :disabled="isDisabled"
        )

    .d-flex.justify-content-end.mb-2.toogle-block(@click="showOthers = !showOthers" style="cursor: pointer" title="切換其他欄位顯示")
      .mr-1 {{ showOthers ? '隱藏其他資訊欄位' : '顯示其他資訊欄位' }}
      lah-fa-icon(
        :icon="showOthers ? 'angle-double-up' : 'angle-double-down'"
        :action="showOthers ? 'move-fade-btt' : 'move-fade-ttb'"
      )

    lah-transition(zoom): .p-4.optional-border(v-show="showOthers")

      b-card-group(deck)
        b-card.border-0(no-body)
          b-form-group(
            label="分機"
            label-for="ext-input"
            label-cols-sm="2"
            label-size="md"
          ): b-input.border-info(
            id="ext-input"
            v-model="userData['ext']"
            :state="checkExt"
            :disabled="isDisabled"
            trim
          )
        b-card.border-0(no-body)
          b-form-group(
            label="職稱"
            label-for="work-title-select"
            label-cols-sm="2"
            label-size="md"
          ): b-select.border-info(
            id="work-title-select"
            v-model="userData['title']"
            :options="workTitleOpts"
            :disabled="isDisabled"
          )

      b-card-group(deck)
        b-card.border-0(no-body)
          b-form-group(
            label="工作"
            label-for="work-input"
            label-cols-sm="2"
            label-size="md"
          ): b-input.border-info(
            id="work-input"
            v-model="userData['work']"
            placeholder="範例：資訊系統管理"
            :disabled="isDisabled"
            trim
          )
        b-card.border-0(no-body)
          b-form-group(
            label="到職"
            label-for="onboard-input"
            label-cols-sm="2"
            label-size="md"
          ): b-input(
            id="onboard-input"
            v-model="userData['onboard_date']"
            trim
            :state="checkOnboardDate"
            :disabled="isDisabled"
            placeholder="範例：110/06/01"
          )

      b-card-group(deck)
        b-card.border-0(no-body)
          b-form-group(
            label="生日"
            label-for="bd-input"
            label-cols-sm="2"
            label-size="md"
          ): b-input(
            id="bd-input"
            v-model="userData['birthday']"
            :state="checkBirthday"
            :disabled="isDisabled"
            placeholder="範例：066/05/23"
            trim
          )
        b-card.border-0(no-body)
          b-form-group(
            label="手機"
            label-for="cell-input"
            label-cols-sm="2"
            label-size="md"
          ): b-input(
            id="cell-input"
            v-model="userData['cell']"
            :state="checkCell"
            :disabled="isDisabled"
            trim
          )

      b-card-group(deck)
        b-card.border-0(no-body)
          b-form-group(
            label="考試"
            label-for="exam-input"
            label-cols-sm="2"
            label-size="md"
          ): b-input(
            id="exam-input"
            v-model="userData['exam']"
            placeholder="範例：107年資訊處理高考三級"
            :disabled="isDisabled"
            trim
          )
        b-card.border-0(no-body)
          b-form-group(
            label="教育"
            label-for="edu-input"
            label-cols-sm="2"
            label-size="md"
          ): b-input(
            id="edu-input"
            v-model="userData['education']"
            placeholder="範例：台北科技大學資訊工程研究所"
            :disabled="isDisabled"
            trim
          )

      //- b-card-group(deck)
      //-   b-card.border-0(no-body)
      //-     b-form-group(
      //-       label="離職"
      //-       label-for="offboard-input"
      //-       label-cols-sm="2"
      //-       label-size="md"
      //-     ): b-input(
      //-       id="offboard-input"
      //-       :value="userData['offboard_date']"
      //-       disabled
      //-       trim
      //-     )

    hr

    b-button-group.d-flex.justify-content-between
      lah-button(icon="save" :variant="saveButtonVariant" @click="save" :disabled="saveButtonDisabled") 儲存變更
      lah-button(icon="user-circle" regular v-if="!isDisabled" variant="info" v-b-modal.upload-user-img-modal) 上傳圖檔

    hr

    lah-user-card(
      :raw="[userData]"
      @click="!isDisabled && showModalById('upload-user-img-modal')"
      no-edit-button
    )

    b-modal(
      id="upload-user-img-modal"
      :title="`更新 ${userData.id} ${userData.name} 照片`"
      size="sm"
      centered
      hide-footer
      scrollable
    )
      b-form-group(
        label="照片"
        label-for="file-user-photo"
        label-cols-sm="2"
        label-size="md"
        title="*.jpg"
      ): b-input-group(id="file-user-photo" size="md")
        b-file(
          ref="file-user-photo"
          v-model="userPhoto"
          placeholder="*.jpg"
          drop-placeholder="放開以設定上傳檔案"
          accept="image/jpeg"
        ): template(slot="file-name" slot-scope="{ names }"): b-badge(variant="primary") {{ names[0] }}
        template(#append): lah-button(
          icon="upload"
          variant="outline-primary"
          title="上傳"
          @click="uploadPhoto"
          :disabled="$utils.empty(userPhoto)"
        )
      b-form-group(
        label="頭像"
        label-for="file-user-avatar"
        label-cols-sm="2"
        label-size="md"
        title="請用正方形比例之大頭照"
      ): b-input-group(id="file-user-avatar" size="md")
        b-file(
          ref="file-user-avatar"
          v-model="userAvatar"
          placeholder="*.jpg"
          drop-placeholder="放開以設定上傳檔案"
          accept="image/jpeg"
        ): template(slot="file-name" slot-scope="{ names }"): b-badge(variant="secondary") {{ names[0] }}
        template(#append): lah-button(
          icon="upload"
          variant="outline-primary"
          @click="uploadAvatar"
          title="上傳"
          :disabled="$utils.empty(userAvatar)"
        )
</template>

<script>
import userBase from '~/components/lah-user-base.js'

export default {
  name: 'LahUserEditCard',
  mixins: [userBase],
  data: () => ({
    userPhoto: null,
    userAvatar: null,
    showOthers: false,
    authorities: []
  }),
  computed: {
    isAuthorized () { return this.authority.isAdmin || this.authority.isUserMgtStaff },
    checkRequired () {
      return this.checkName === true &&
             this.checkIp === true &&
             this.checkOnboardDate !== false &&
             this.checkExt !== false &&
             this.checkBirthday !== false &&
             this.checkCell !== false
    },
    modified () {
      return !this.$utils.equal(this.userData, this.origUserData)
    },
    checkId () {
      if (this.$utils.empty(this.userData.id) || this.userData.id.length < 6) {
        return false
      }
      return true
    },
    checkName () {
      return !this.$utils.empty(this.userData.name) && this.userData.name.length > 1
    },
    checkIp () {
      return this.$utils.isIPv4(this.userData.ip) || this.userData.ip === '::1'
    },
    checkExt () {
      if (this.$utils.empty(this.userData.ext)) {
        return null
      }
      const regex = new RegExp('^\\d{3,4}$', 'gm')
      return Boolean(this.userData.ext.match(regex))
    },
    checkBirthday () {
      if (this.$utils.empty(this.userData.birthday)) {
        return null
      }
      const regex = new RegExp('^\\d{3,4}/\\d{1,2}/\\d{1,2}$', 'gm')
      return Boolean(this.userData.birthday.match(regex))
    },
    checkCell () {
      if (this.$utils.empty(this.userData.cell)) {
        return null
      }
      const regex = new RegExp('^0\\d{9}$', 'gm')
      return Boolean(this.userData.cell.match(regex))
    },
    checkOnboardDate () {
      if (this.$utils.empty(this.userData.onboard_date)) {
        return null
      }
      const regex = new RegExp('^\\d{3,4}/\\d{1,2}/\\d{1,2}$', 'gm')
      return Boolean(this.userData.onboard_date.match(regex))
    },
    saveButtonVariant () {
      return this.saveButtonDisabled ? 'secondary' : 'outline-success'
    },
    saveButtonDisabled () {
      if (this.modified && this.checkRequired) {
        return false
      }
      return true
    },
    uploadUrl () { return `/img${this.$consts.API.FILE.PHOTO}` },
    authOpts () {
      return [
        { value: this.$consts.AUTHORITY.DISABLED, text: '停用' },
        { value: this.$consts.AUTHORITY.ADMIN, text: '系統管理', disabled: this.isDisabled },
        { value: this.$consts.AUTHORITY.ANNOUNCEMENT_MANAGEMENT, text: '訊息管理', disabled: this.isDisabled },
        { value: this.$consts.AUTHORITY.USER_MANAGEMENT, text: '人員管理', disabled: this.isDisabled },
        { value: this.$consts.AUTHORITY.CHIEF, text: '主管', disabled: this.isDisabled },
        { value: this.$consts.AUTHORITY.RESEARCH_AND_EVALUATION, text: '研考', disabled: this.isDisabled }
      ]
    }
  },
  watch: {
    authorities (array) {
      this.userData.authority = array.reduce((acc, item) => {
        return acc + item
      }, 0)
    }
  },
  beforeCreate () {
    // https://vuejs.org/v2/guide/components-edge-cases.html#Circular-References-Between-Components
    this.$options.components.LahUserCard = require('~/components/lah-user-card.vue').default
  },
  created () {
    // deep copy
    this.origUserData = { ...this.userData }
    this.restoreAuthorities()
  },
  methods: {
    formatter (val) {
      return val.toUpperCase()
    },
    assignUserData (array) {
      // use spread operator since it make object reaactively in Vue2
      this.userData = { ...this.userData, ...array }
    },
    toTWFormat (adDate) {
      let twDate = adDate.replace('/-/g', '/')
      // detect if it is AD date
      if (twDate.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
        // to TW date
        twDate = parseInt(twDate.substring(0, 4)) - 1911 + twDate.substring(4)
      }
      return twDate
    },
    toADFormat (twDate) {
      let adDate = twDate.replace('/-/g', '/')
      // detect if it is TW date
      if (adDate.match(/^\d{3}\/\d{2}\/\d{2}$/)) {
        // to AD date
        adDate =
          parseInt(adDate.substring(0, 3)) + 1911 + adDate.substring(3)
      }
      return adDate
    },
    update (prompt, config) {
      return new Promise((resolve, reject) => {
        this.confirm(prompt).then((answer) => {
          if (answer) {
            this.isBusy = true
            this.$axios.post(this.$consts.API.JSON.USER, config).then(({ data }) => {
              if (this.$utils.statusCheck(data.status)) {
                this.notify(data.message, { type: 'success' })
                const today = this.$utils.now().split(' ')[0].replaceAll('-', '/')
                if (config.type === 'user_onboard') {
                  this.userData.offboard_date = ''
                  this.userData.onboard_date = today
                } else if (config.type === 'user_offboard') {
                  this.userData.offboard_date = today
                }
                resolve(this.userData)
              } else {
                this.notify(data.message, { type: 'warning' })
                reject(data.message)
              }
            }).catch((err) => {
              this.$utils.error(err)
              reject(err)
            }).finally(() => {
              this.isBusy = false
            })
          } else {
            reject('user cancelled the confirmation!')
          }
        })
      })
    },
    save () {
      this.update('確定要更新?', {
        type: 'save_user_info',
        data: this.userData
      }).then((userData) => {
        this.trigger('saved', userData)
        this.origUserData = { ...this.origUserData, ...userData }
      })
    },
    upload (file, avatar = false) {
      this.isBusy = true
      const formData = new FormData()
      formData.append('file', file)
      formData.append('id', this.userData.id)
      formData.append('name', this.userData.name)
      formData.append('avatar', avatar)
      this.$upload.post(this.uploadUrl, formData).then(({ data }) => {
        const opts = { type: 'warning', title: '上傳圖檔結果通知' }
        if (this.$utils.statusCheck(data.status)) {
          opts.type = 'success'
        }
        this.notify(data.message, opts)
      }).catch((err) => {
        this.$utils.error(err)
      }).finally(() => {
        this.isBusy = false
        // mark upload operation done
        this.$store.commit('timestamp')
      })
    },
    uploadPhoto () {
      this.upload(this.userPhoto, false)
      this.userPhoto = null
    },
    uploadAvatar () {
      this.upload(this.userAvatar, true)
      this.userAvatar = null
    },
    restoreAuthorities () {
      const authority = this.userData.authority
      this.$consts.AUTHORITY.DISABLED === (this.$consts.AUTHORITY.DISABLED & authority) && this.authorities.push(this.$consts.AUTHORITY.DISABLED)
      this.$consts.AUTHORITY.ADMIN === (this.$consts.AUTHORITY.ADMIN & authority) && this.authorities.push(this.$consts.AUTHORITY.ADMIN)
      this.$consts.AUTHORITY.ANNOUNCEMENT_MANAGEMENT === (this.$consts.AUTHORITY.ANNOUNCEMENT_MANAGEMENT & authority) && this.authorities.push(this.$consts.AUTHORITY.ANNOUNCEMENT_MANAGEMENT)
      this.$consts.AUTHORITY.USER_MANAGEMENT === (this.$consts.AUTHORITY.USER_MANAGEMENT & authority) && this.authorities.push(this.$consts.AUTHORITY.USER_MANAGEMENT)
      this.$consts.AUTHORITY.CHIEF === (this.$consts.AUTHORITY.CHIEF & authority) && this.authorities.push(this.$consts.AUTHORITY.CHIEF)
      this.$consts.AUTHORITY.RESEARCH_AND_EVALUATION === (this.$consts.AUTHORITY.RESEARCH_AND_EVALUATION & authority) && this.authorities.push(this.$consts.AUTHORITY.RESEARCH_AND_EVALUATION)
    }
  }
}
</script>

<style lang="scss" scoped>
.toogle-block:hover {
  font-weight: bolder;
  text-decoration: underline;
}
.optional-border {
  border-style: dashed;
  border-width: 2px;
  border-radius: .75rem;
  border-color: gray;
}
</style>
