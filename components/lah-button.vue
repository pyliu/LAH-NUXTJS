<template lang="pug">
  b-button.text-nowrap(
    :link="link"
    :variant="variant"
    :size="size"
    :pill="pill"
    :block="block"
    :pressed="pressed"
    :class="noBorder ? 'border-0 align-middle' : ' align-middle'"
    :href="href"
    :disabled="disabled"
    @mouseenter="mouseenter"
    @mouseleave="mouseleave"
    @blur="mouseleave"
    @click="emitClick($event)"
    style="display: flex; align-items: center; justify-content: center;"
  ): lah-fa-icon(
    ref="icon"
    :prefix="faIconPrefix"
    :icon="icon"
    :size="iconSize"
    :append="iconAppend"
    :no-gutter="noIconGutter"
    :variant="iconVariant"
  )
    span.ld-txt(v-if="busy") 讀取中...
    span(v-show="!busy")
      slot
      b-badge.ml-1(
        v-if="showBadge"
        :variant="badgeVariant"
        :pill="badgePill"
      ) {{ badgeText }}
</template>

<script>
export default {
  props: {
    to: { type: String, default: undefined },
    href: { type: String, default: undefined },
    noBorder: { type: Boolean, default: false },
    variant: { type: String, default: 'outline-primary' },
    size: { type: String, default: 'sm' },
    icon: { type: String, default: '' },
    iconSize: { type: String, default: 'lg' },
    iconAppend: { type: Boolean, default: false },
    iconVariant: { type: String, default: '' },
    regular: { type: Boolean, default: false },
    brand: { type: Boolean, default: false },
    action: { type: String, default: undefined },
    pill: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
    pressed: { type: Boolean, default: false },
    link: { type: Boolean, default: false },
    badgeText: { type: String, default: '' },
    badgeVariant: { type: String, default: 'light' },
    badgePill: { type: Boolean, default: true },
    busy: { type: Boolean, default: false },
    noIconGutter: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  computed: {
    faIconPrefix () {
      return this.brand ? 'fab' : this.regular ? 'far' : 'fas';
    },
    showBadge () { return !this.$utils.empty(this.badgeText) },
    showIcon () { return !this.$utils.empty(this.icon) },
    iconId () { return this.$refs.icon.iconId }
  },
  methods: {
    emitClick (evt) {
      if (this.$utils.empty(this.to)) {
        this.$emit('click', evt)
      } else {
        this.$router.push(this.to)
      }
      evt.stopPropagation()
    },
    mouseenter () {
      const movement = this.action ? `ld-${this.action.replace('ld-', '')}` : 'ld-breath';
      // movement is 'undefined' will be random effect
      this.$utils.addAnimation(`#${this.iconId}`, movement)
    },
    mouseleave () {
      this.$utils.clearAnimation(`#${this.iconId}`)
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
