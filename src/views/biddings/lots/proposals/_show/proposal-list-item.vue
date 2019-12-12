<style scoped lang="scss">
  .proposal-actions {
    text-align: center;
  }

  .success-text {
    color: $apple-green;

    .fa-star {
      color: gold;
    }
  }

  .danger-text {
    color: $danger-color;
  }
</style>

<template lang="pug">
  li(v-if="lot_group_item_lot_proposal", @click="$emit('click')")
    h5.mb-0 {{ lot_group_item_lot_proposal.lot_group_item.item_short_name }}

    div
      label.inline-block.mr-0-5
        | {{ $t('models.group_item.attributes.quantity') }}:
      span
        | {{ $asNumber(lot_group_item_lot_proposal.lot_group_item.quantity, { precision: 2 }) }}

        | {{ lot_group_item_lot_proposal.lot_group_item.item_unit }}
    div
      label.inline-block.mr-0-5
        | {{ $t('.items.value') }}
      span
        | {{ $asCurrency(lot_group_item_lot_proposal.price) }}

</template>

<script>
  export default {
    props: {
      lot_group_item_lot_proposal: { type: Object },
      index: { type: Number }
    },

    data() {
      return {
        i18nScope: 'biddings.lots.proposals._show.proposal_list_item'
      }
    },
  }
</script>
