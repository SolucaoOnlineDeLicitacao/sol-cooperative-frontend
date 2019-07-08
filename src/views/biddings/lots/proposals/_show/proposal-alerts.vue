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
  .proposal-actions.mt-1(v-if="status == 'coop_accepted'")
    .alert.alert-success.mb-2
      | {{ $t('.alerts.alert') }}

    span.success-text
      | {{ $t('.alerts.coop_accepted') }}

  .proposal-actions.mt-1(v-else-if="status == 'coop_refused' || status == 'refused'")
    span.danger-text
      | {{ $t('.alerts.refused') }}

  .proposal-actions.mt-1(v-else-if="status == 'accepted'")
    span.success-text
      i.fa.fa-star.mr-1
      | {{ $t('.alerts.accepted') }}

</template>

<script>
  export default {
    props: {
      status: { type: String, default: '' }
    },

    data() {
      return {
        i18nScope: 'biddings.lots.proposals._show.proposal_alerts',
      }
    },
  }
</script>
