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

        textarea-field.mt-2(
          v-model="comment",
          name="comment",
          :label="$t('.label')",
          :error="errors.comment"
        )

        .text-center.mt-2
          button.button.button-danger(@click="refuseProposal(item.id)", :disabled="refusing")
            template(v-if="refusing")
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
        i18nScope: 'biddings.lots.proposals._index.refuse_proposal_overlay',

        // buttons
        refusing: false,
        errors: {},
        comment: ''
      }
    },

    methods: {
      close() {
        this.$emit('closeOverlay')
      },

      success() {
        this.$emit('success')
      },

      refuseProposal(id) {
        let params = { comment: this.comment }

        this.refusing = true

        this.$http.patch('/cooperative/' + this.routeName + '/' + id + '/refuse', params)
          .then((response) => {
            this.$notifications.clear()
            this.$notifications.info(this.$t('.notifications.refuse.success'))

            this.success()
          })
          .catch((err) => {
            let errors = _.dig(err, 'response', 'data', 'errors') || {}

            this.errors = this.$i18n.errify(errors, { model: 'proposal' })
            this.$notifications.error(this.$t('.notifications.refuse.failure'))
          })
          .then(() => {
            this.refusing = false
          })
      },
    }
  }

</script>

