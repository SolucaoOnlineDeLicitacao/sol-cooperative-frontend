<style scoped lang="scss">
</style>

<template lang="pug">
    overlay-wnd(v-if="showOverlay", @close="close")
      .container(v-if="item")
        h4.mt-2.text-center {{ $t('.title') }}
        hr.mt-0.mb-2.o-container

        .alert.alert-info
          | {{ $t('.alert') }}


        label.mt-2
          | {{ $t('models.proposal.attributes.provider') }}:
        span.provider-name
          | {{ this.item.provider.name }}

        label.mt-2
          | {{ $t('models.proposal.attributes.document') }}:
        span
          | {{ this.item.provider.document }}

        label.mt-2
          | {{ $t('models.proposal.attributes.price_total') }}:
        span
          | {{ $asCurrency(this.item.price_total) }}

        .text-center.mt-2
          button.button.button-primary(@click="acceptProposal(item.id)", :disabled="accepting")
            template(v-if="accepting")
              i.fa.fa-spinner.fa-spin
            template(v-else)
              | {{ $t('.button') }}

</template>

<script>

  export default {
    props: {
      item: { type: Object },
      showOverlay: { type: Boolean, default: false },
      routeName: { type: String, default: 'lot_proposals' }
    },

    data() {
      return {
        i18nScope: 'biddings.lots.proposals._index.accept_proposal_overlay',

        // buttons
        accepting: false,
      }
    },

    methods: {
      close() {
        this.$emit('closeOverlay')
      },

      success() {
        this.$emit('success')
      },

      acceptProposal(id) {
        this.accepting = true

        this.$http.patch('/cooperative/' + this.routeName + '/' + id + '/accept')
          .then((response) => {
            this.$notifications.clear()
            this.$notifications.info(this.$t('.notifications.accept.success'))

            this.success()
          })
          .catch((err) => {
            this.$notifications.error(this.$t('.notifications.accept.failure'))
          })
          .then(() => {
            this.accepting = false
          })
      },
    }
  }

</script>

