<style scoped lang="scss">
</style>

<template lang="pug">

  overlay-wnd(v-if="showOverlay", @close="close")
    .container(:class="this.overlayItem.maxQuantity ? 'max' : ''")
      h4.mt-2.text-center Detalhes do item
      hr.mt-0.mb-2.o-container

      label.mt-2
        | {{ $t('models.group_item.attributes.itemName') }}:
      span
        | {{ this.overlayItem.item_name }}

      label.mt-2
        | {{ $t('models.group_item.attributes.quantity') }}:
      span
        | {{ $asNumber(this.overlayItem.quantity, { precision: 2 }) || this.$t('messages.not_informed') }} / {{ $asNumber(this.overlayItem.available_quantity, { precision: 2 }) }}

        | {{ this.overlayItem.item_unit }}

      .alert.alert-warning.mt-2(v-if="this.overlayItem.maxQuantity")
        | Atenção: Quantidade informada é maior do que a quantidade disponível!

</template>

<script>
  export default {
    props: {
      overlayItem: { type: Object },
      showOverlay: { type: Boolean, default: false }
    },

    data() {
      return {
        i18nScope: 'components.group-item-overlay',
      }
    },

    methods: {
      close() {
        this.$emit('closeOverlay')
      },
    }
  }

</script>
