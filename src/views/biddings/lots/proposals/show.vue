<style scoped lang="scss">
  .proposal-actions {
    text-align: center;

    .button {
      padding: 0 10px;
      margin-right: 10px;

      cursor: pointer;

      &:last-child {
        margin-right: 0;
      }
    }
  }

</style>

<template lang="pug">
  .mt-2
    .container(v-if="isLoading")
      .card

        h4.mt-2

        ul.blink-50
          li.list-item.mb-1
            .container
              .list-title
              i.fas.fa-spinner.fa-pulse.fa-2x
          li.list-item.mb-1.loading-2
            .container
              .list-title
              i.fas.fa-spinner.fa-pulse.fa-2x

          li.list-item.mb-1.loading-3
            .container
              .list-title
              i.fas.fa-spinner.fa-pulse.fa-2x

          li.list-item.mb-1.loading-4
            .container
              .list-title
              i.fas.fa-spinner.fa-pulse.fa-2x

    .container(v-else)
      .card
        h4 {{ $t('.general.title') }}
        hr.mt-0.mb-2.o-container

        div
          label {{ $t('.general.supplier', { name: proposal.provider.name}) }}

        div
          | {{ $t('.general.total', { value: $asCurrency(proposal.price_total)}) }}

        proposal-alerts(:status="proposal.status")

      .card.mt-2.mb-2
        h4 {{ $t('.items.title') }}
        hr.mt-0.mb-2.o-container

        ul.mb-0
          template(v-for="(lot_group_item_lot_proposal, index) in proposal.lot_group_item_lot_proposals" @click="toggleOverlay(lot_group_item_lot_proposal.lot_group_item)")
            proposal-list-item(:lot_group_item_lot_proposal="lot_group_item_lot_proposal", :index="index", @click="toggleOverlay(lot_group_item_lot_proposal.lot_group_item)")

          hr.mt-0.mb-2.o-container

          li
            label.list-span {{ $t('.items.delivery') }}
            span
             | {{ $asCurrency(proposal.delivery_price) }}


        .proposal-actions.mt-1(v-if="proposal.current")
          hr.mt-0.mb-2.o-container
          .button.button-danger(@click="toggleRefuseOverlay(proposal)")
            | {{ $t('.buttons.refuse') }}
          .button.button-primary(@click="toggleAcceptOverlay(proposal)")
            | {{ $t('.buttons.accept') }}

    lot-group-item-overlay(:showOverlay="showOverlay", :overlayItem="overlayItem", @closeOverlay="showOverlay = false")

    accept-proposal-overlay(:showOverlay="showAcceptOverlay", :item="acceptOverlayItem", @closeOverlay="showAcceptOverlay = false", @success="successAccept")

    refuse-proposal-overlay(:showOverlay="showRefuseOverlay", :item="refuseOverlayItem", @closeOverlay="showRefuseOverlay = false", @success="successRefuse")

</template>

<script>
  import AcceptProposalOverlay from './_index/accept-proposal-overlay'
  import RefuseProposalOverlay from './_index/refuse-proposal-overlay'
  import ProposalAlerts from './_show/proposal-alerts'
  import ProposalListItem from './_show/proposal-list-item'

  export default {
    name: 'proposal',

    components: {
      AcceptProposalOverlay,
      RefuseProposalOverlay,
      ProposalAlerts,
      ProposalListItem
    },

    data () {
      return {
        i18nScope: 'biddings.lots.proposals.show',

        // resource
        isLoading: true,
        bidding: null,
        proposal: null,
        lot_proposals: {},

        // overlay
        overlayItem: null,
        showOverlay: false,
        acceptOverlayItem: null,
        showAcceptOverlay: false,
        refuseOverlayItem: null,
        showRefuseOverlay: false,

        params: {},

        tabs: [
          {
            route: { name: 'bidding', params: {} },
            icon: 'fa-file',
            text: this.$t('models.bidding.one'),
            active: false,
          },

          {
            route: { name: 'lots', params: { bidding_id: null } },
            icon: 'fa-list',
            text: this.$t('biddings.lots.index.tabs.lots'),
            active: true,
          },

          {
            route: { name: 'invites', params: {} },
            icon: 'fa-envelope',
            text: this.$t('biddings.lots.index.tabs.invites'),
            active: false,
          }
        ]
      }
    },

    methods: {
      fetch() {
        let params = this.params

        this.isLoading = true

        return this.$http.get('/cooperative/biddings/' + this.biddingId)
          .then((response) => {
            this.bidding = response.data
            return response
          })
          .then((response) => {
            this.$http.get('/cooperative/biddings/' + this.biddingId + '/lots/' + this.lotId + '/lot_proposals/' + params.id)
              .then((response) => {
                this.proposal = response.data
                this.lot_proposals = this.proposal.lot_proposals

                this.isLoading = false

              }).catch((_err) => {
                this.error = _err
                console.error(_err)
              })

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      toggleAcceptOverlay(proposal) {
        this.acceptOverlayItem = proposal
        this.showAcceptOverlay = true
      },

      toggleRefuseOverlay(proposal) {
        this.refuseOverlayItem = proposal
        this.showRefuseOverlay = true
      },

      toggleOverlay(item) {
        this.overlayItem = item
        this.showOverlay = true
      },

      successAccept() {
        this.showAcceptOverlay = false
        this.fetch()
      },

      successRefuse() {
        this.showRefuseOverlay = false
        this.fetch()
      },

      parseRoute() {
        let params = {}
        params.id = this.$params.asInteger(this.$route.params.id)

        this.biddingId = this.$params.asInteger(this.$route.params.bidding_id)
        this.lotId = this.$params.asInteger(this.$route.params.lot_id)
        this.params = params
      },

      updateTabsRoutes() {
        this.tabs[0].route.params = { id: this.biddingId }
        this.tabs[1].route.params = { bidding_id: this.biddingId }
        this.tabs[2].route.params = { bidding_id: this.biddingId, lot_id: this.lotId }
      },

      init() {
        this.parseRoute()
        this.updateTabsRoutes()
        this.fetch()
        this.$emit('tabChanged', this.tabs)
      }
    },

    created: function () {
      this.init();
    },

  }

</script>
