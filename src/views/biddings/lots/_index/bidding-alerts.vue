<template lang="pug">
  .alert.alert-info.mb-2(v-if="status == 'ongoing' && closedInviteAndOngoing")
    | {{ $t('.ongoing_and_closed', { status: $t('models.bidding.attributes.statuses.' + status) }) }}

  .alert.alert-info.mb-2(v-else-if="defaultStatus")
    | {{ $t('.' + status, { status: $t('models.bidding.attributes.statuses.' + status) }) }}

</template>

<script>
  export default {
    props: {
      status: { type: String, default: '' },
      closedInviteAndOngoing: { type: Boolean }
    },

    data() {
      return {
        i18nScope: 'biddings.index._index.bidding_alerts',
      }
    },

    computed: {
      defaultStatus() {
        return _.includes(this.allowedStatuses, this.status)
      },

      allowedStatuses() {
        return ['waiting', 'approved', 'under_review', 'draw', 'ongoing']
      }
    }
  }
</script>
