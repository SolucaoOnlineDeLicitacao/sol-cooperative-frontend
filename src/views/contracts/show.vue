<style scoped lang="scss">
  .badge {
    &.waiting_signature {
      background-color: $greyish-brown;
    }

    &.signed {
      background-color: $cerulean;
    }

    &.refused {
      background-color: $danger-color;
    }

    &.partial_execution,
    &.total_inexecution {
      background-color: $peach;
    }

    &.completed {
      background-color: $apple-green;
    }
  }

  .or-line {
    width: 100%;
    text-align: center;
    border-bottom: 1px solid #E1E1E1;
    line-height: 0.1em;
    margin: 10px 0 20px;

    span {
      font-weight: bold;
      background: #fff;
      padding: 0 20px;
    }
  } 

</style>

<template lang="pug">
  .root
    .resource-container(v-if="contract")
      .card
        h5 {{ $t('.general.title') }}

        .row
          label {{ $t('models.contract.one') }}
          span {{ contract.title }}

        .row
          label {{ $t('models.contract.attributes.bidding_title') }}
          router-link.router-link(:to="{ name: 'bidding', params: { id: this.contract.bidding_id } }")
            | {{ contract.bidding_title }}

        .row
          label {{ $t('models.contract.attributes.provider_title') }}
          span {{ contract.provider_title }}

        .row
          label {{ $t('models.contract.attributes.price_total') }}
          span
            | {{ $asCurrency(contract.price_total) }}

        .row
          label {{ $t('models.contract.attributes.status') }}
          span.badge(:class="currentStatus")
            | {{ $t('models.contract.attributes.statuses.' + currentStatus) }}

        .row(v-if="contract.contract_pdf")
          a.button(:href="contractPath", target="_blank")
            | {{ $t('.general.button.download') }}

      .card.mt-2
        h5 {{ $t('.signatures.title') }}

        .row
          label {{ $t('models.contract.attributes.supplierSignedAt') }}

          template(v-if="contract.refused_by_class == 'supplier'")
            span {{ $t('.refused.at', { value: contract.refused_by_at }) }}
          template(v-else)
            span {{ contract.supplier_signed_at || $t('.signatures.waiting') }}

        .row
          label {{ $t('models.contract.attributes.userSignedAt') }}
          span {{ contract.user_signed_at || $t('.signatures.waiting') }}

      .card.mt-2(v-if="refusedStatus")
        h5 {{ $t('.refused.title') }}

        .alert.alert-info
          | {{ $t('.refused.description') }}

        template(v-if="creating")
         .text-center.mt-2
            i.fa.fa-spin.fa-spinner.fa-2x

        template(v-else)
          .button.button-long.u-full-width.mb-0(@click="cancelAndClone")
            | {{ $t('.refused.buttons.cancel') }}

          .or-line.mt-2.mb-2
            span {{ $t('.refused.or_line') }}

          .button.button-long.u-full-width(@click="reloadProposals")
            | {{ $t('.refused.buttons.reload_proposals') }}

      .text-center.mt-2(v-if="canUpdateStatus")
        .button(@click="openStatusOverlay()")
          | {{ $t('.button.open') }}

      overlay-wnd(v-if="showStatusOverlay", @close="showStatusOverlay = false")
        .container(v-if="contract")
          h4.mt-2.text-center {{ $t('.overlay.title') }}
          hr.mt-0.mb-2.o-container

          .alert.alert-info
            | {{ $t('.overlay.alert') }}

          label.inline-block.mr-0-5.mt-1
            | {{ $t('models.contract.one') }}:
          span
            | {{ this.contract.title }}

          select-field.mt-1(
            name="contract[status]",
            v-model="contract.status",
            :label="$t('.overlay.field.status.label')",
            :options="statuses",
            :error="errors.status",
            require=true
          )

          template(v-if="newStatus")
            .alert.alert-info
              | {{ $t('.statuses.' + contract.status + '.description') }}

          template(v-if="completedStatus")
            .text-center.mt-2
              button.button.button-primary(@click="completed", :disabled="completing")
                template(v-if="completing")
                  i.fa.fa-spin.fa-spinner
                template(v-else)
                  | {{ $t('.button.completed.submit') }}

          template(v-else-if="totalInexecutionStatus")
            .mt-2
              .input-group
                input(type="radio" id="new" value="new" v-model="picked")
                label.inline-block.mr-0-5(for="new") {{ $t('.button.total_inexecution.new') }}

              .input-group
                template(v-if="cantChooseAnother")
                  input(type="radio" id="nop" value="nop" disabled="disabled")
                template(v-else)
                  input(type="radio" id="another" value="another" v-model="picked")
                label.inline-block.mr-0-5(for="another", :class="cantChooseAnother ? 'disabled' : ''") {{ $t('.button.total_inexecution.another') }}

                template(v-if="cantChooseAnother")
                  .alert.alert-warning
                    | {{ $t('.total_inexecution.alert.cant_choose_another') }}

            template(v-if="picked")
              .alert.alert-info
                | {{ $t('.total_inexecution.' + picked + '.description') }}

              .text-center.mt-2
                button.button.button-primary(@click="totalInexecution", :disabled="totalInexecuting")
                  template(v-if="totalInexecuting")
                    i.fa.fa-spin.fa-spinner
                  template(v-else)
                    | {{ $t('.button.total_inexecution.submit') }}

          template(v-else-if="partialInexecutionStatus")
            .text-center.mt-2
              router-link.router-link.button(:to="{ name: 'editPartialExecutionContract', params: { id: this.contract.id }}")
                | {{ $t('.button.partial_execution.submit') }}

    .contract(v-else-if="notFound")
      .container
        .card.mt-1
          | {{ $t('.not_found') }}

    overlay-notification(v-if="showCancelAndcloneOverlay", :showOverlay="showCancelAndcloneOverlay", :text="$t('.notifications.refused.clone.success')" @ok="redirectToBiddingsIndex")

    overlay-notification(v-if="showReloadProposalsOverlay", :showOverlay="showReloadProposalsOverlay", :text="$t('.notifications.refused.proposal.success')" @ok="redirectToLotsIndex")
</template>

<script>
  import view from '@/view.vue'

  export default {
    name: 'contract',
    data () {
      return {
        i18nScope: 'contracts.show',
        contract: null,
        params: null,
        comment: '',
        errors: {},
        picked: null,
        notFound: null,
        currentStatus: null,

        showStatusOverlay: false,
        showCancelAndcloneOverlay: false,
        showReloadProposalsOverlay: false,

        // btns
        totalInexecuting: false,
        completing: false,
        creating: false,

        tabs: [
          {
            route: { name: 'contract', params: {} },
            icon: 'fa-file',
            text: this.$t('contracts.show.tabs.contract'),
            active: true,
          },

          {
            route: { name: 'proposal', params: {} },
            icon: 'fa-list',
            text: this.$t('contracts.show.tabs.proposal'),
            active: false,
          }
        ]
      }
    },

    computed: {
      proposalLink() {
        if(!this.contract) return

        let kind = this.contract && this.contract.bidding_kind

        if (kind == 'global') {
          return { name: 'globalProposal', params: { bidding_id: this.contract.bidding_id, id: this.contract.proposal_id } }
        } else {
          return { name: 'proposal', params: { bidding_id: this.contract.bidding_id, lot_id: this.contract.lot_ids[0], id: this.contract.lot_proposal_ids[0] } }
        }
      },

      contractPath() {
        return this.contract && this.$http.host + "/" + this.contract.contract_pdf
      },

      cantChooseAnother() {
        return this.contract && this.contract.proposals_count <= 1
      },

      newStatus() {
        let status = this.contract.status
        return status && ! this.waitingSignatureStatus
      },

      totalInexecutionStatus() {
        let status = this.contract.status
        return status && status == "total_inexecution"
      },

      partialInexecutionStatus() {
        let status = this.contract.status
        return status && status == "partial_execution"
      },

      waitingSignatureStatus() {
        let status = this.contract.status
        return status && status == "waiting_signature"
      },

      signedStatus() {
        let status = this.currentStatus
        return status && status == "signed"
      },

      refusedStatus() {
        let status = this.contract.status
        return status && status == "refused"
      },

      completedStatus() {
        let status = this.contract.status
        return status && status == "completed"
      },

      canUpdateStatus() {
        return this.signedStatus
      },

      hideContent() {
        return this.showCancelAndcloneOverlay || this.showReloadProposalsOverlay
      },

      statuses() {
        return [
          { id: 'signed', text: this.$t('options.blank') },
          { id: 'completed', text: this.$t('models.contract.attributes.statuses.completed') },
          { id: 'partial_execution', text: this.$t('models.contract.attributes.statuses.partial_execution') },
          { id: 'total_inexecution', text: this.$t('models.contract.attributes.statuses.total_inexecution') }
        ]
      },
    },

    methods: {
      getContract() {
        return this.$http.get('/cooperative/contracts/' + this.params.id)
          .then((response) => {
            this.contract = response.data
            this.currentStatus = this.contract.status
            this.changeTabs()

            this.$emit('navbarTitleChanged', this.$t('.title', { title: this.contract.title }))

          }).catch((_err) => {
            let responseStatus = _err.response.status
            this.notFound = responseStatus == 404

            console.error(_err)
          })
      },

      openStatusOverlay() {
        this.showStatusOverlay = true
      },

      closeStatusOverlay() {
        this.showStatusOverlay = false
      },

      completed() {
        this.completing = true

        return this.$http.patch('/cooperative/contracts/' + this.contract.id + '/completed')
          .then((response) => {
            this.$notifications.clear()
            this.$notifications.info(this.$t('.notifications.completed.success'))

            this.getContract()
            this.closeStatusOverlay()
          })
          .catch((err) => {
            this.$notifications.error(this.$t('.notifications.completed.failure'))
          }).then(() => {
            this.completing = false
          })
      },

      totalInexecution() {
        this.totalInexecuting = true

        return this.$http.patch(this.totalInexecutionPath())
          .then((response) => {
            this.$notifications.clear()
            this.$notifications.info(this.$t('.notifications.total_inexecution.success'))

            this.getContract()
            this.closeStatusOverlay()
          })
          .catch((err) => {
            console.log(err)
            this.$notifications.error(this.$t('.notifications.total_inexecution.failure'))
          }).then(() => {
            this.totalInexecuting = false
          })
      },

      totalInexecutionPath() {
        if(this.picked == "new") {
          return '/cooperative/contracts/' + this.contract.id + '/total_inexecution/clone_bidding'
        }else if(this.picked == "another") {
          return '/cooperative/contracts/' + this.contract.id + '/total_inexecution/proposal'
        }
      },

      cancelAndClone() {
        this.creating = true

        return this.$http.patch('/cooperative/contracts/' + this.contract.id + '/refused/clone_bidding')
          .then((response) => {
            this.$notifications.clear()
            this.showCancelAndcloneOverlay = true
          })
          .catch((err) => {
            this.$notifications.clear()
            this.$notifications.error(this.$t('.notifications.refused.clone.failure'))
          })
          .then(() => {
            this.creating = false
          })
      },

      reloadProposals() {
        this.creating = true

        return this.$http.patch('/cooperative/contracts/' + this.contract.id + '/refused/proposal')
          .then((response) => {
            this.$notifications.clear()
            this.showReloadProposalsOverlay = true
          })
          .catch((err) => {
            this.$notifications.clear()
            this.$notifications.error(this.$t('.notifications.refused.proposal.failure'))
          })
          .then(() => {
            this.creating = false
          })
      },

      redirectToBiddingsIndex() {
        let redirectToRoute = { name: 'biddings' }
        this.$router.replace(redirectToRoute)
      },

      redirectToLotsIndex() {
        let redirectToRoute = { name: 'lots', params: { bidding_id: this.contract.bidding_id } }
        this.$router.replace(redirectToRoute)
      },

      parseRoute() {
        let params = {}

        params.id = this.$params.asInteger(this.$route.params.id)

        this.params = params
      },

      changeTabs() {
        // add resource id to router tab
        this.tabs[1].route = this.proposalLink
        this.$emit('tabChanged', this.tabs)
      }


    },

    created: function () {
      this.parseRoute()
      this.getContract()
    }
  }

</script>
