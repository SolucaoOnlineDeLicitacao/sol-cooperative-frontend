<style scoped lang="scss">
  .list-item {
    position: relative;
  }

  .lowest-badge {
    padding: 2px 10px;
    position: absolute;
    right: 0;
    top: -25px;
    z-index: 2;

    font-size: 13px;
    background-color: rgba(126, 211, 33, 0.7);
    color: white;
    border-radius: 15px;
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    box-shadow: -1px 3px 4px 1px #b9b9b963;
  }

  .span-inline-label {
    margin-right: 4px;
  }

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

  .success-text {
    color: $apple-green;
    display: block;
    text-align: left;

    .fa-star {
      color: gold;
    }
  }

  .danger-text {
    color: $danger-color;
  }
  
  .container {
    width: 100%;
  }

  .span-inline-label {
    display: block;
    font-weight: normal;
    font-size: 80%;
    color: $greyish-brown-two;
  }
</style>

<template lang="pug">
  li.list-item.row.pb-0
    .lowest-badge(v-if="proposal.current")
      | {{ $t('.proposals.current') }}
    .container
      .list-title(v-if="seeWithDetails")
        span.span-inline-label {{ $t('.proposals.supplier') }}
        span.provider-title {{ proposal.provider.name }}
      .list-title(v-else)
        | {{ $t('.proposals.proposal') }} {{ index+1 }}

      .list-span.mt-0(v-if="!index && proposal.suppliers")
        | {{ proposal.suppliers[0].email }}
      
      .list-span.mt-0(v-if="!index && proposal.suppliers")
        | {{ proposal.suppliers[0].phone }}

      .list-span.mt-1
        span.span-inline-label {{ $t('.total', { value: '' }) }}
        | {{ $asCurrency(proposal.price_total) }}

      .proposal-actions.mt-1(v-if="proposal.current")
        .button.button-danger.button-refuse-proposal(@click="toggleRefuseOverlay(proposal)")
          | {{ $t('.proposals.buttons.refuse') }}

        router-link.mt-1.mb-0.button(:to="showPath")
          | {{ $t('.proposals.buttons.view') }}

        .button.button-primary.button-accept-proposal(@click="toggleAcceptOverlay(proposal)")
          | {{ $t('.proposals.buttons.accept') }}

      .proposal-actions.mt-1(v-else-if="proposal.status == 'coop_accepted'")
        span.success-text
          span.span-inline-label {{ $t('.status') }}
          i.fa.fa-star.mr-1
          | {{ $t('.proposals.status.coop_accepted') }}

        .alert.alert-success.mb-2.mt-1
          | {{ $t('.proposals.alert') }}

        router-link.mt-1.mb-0.button.ml-1(:to="showPath")
          | {{ $t('.proposals.buttons.view') }}

      .proposal-actions.mt-1(v-else-if="proposal.status == 'coop_refused' || proposal.status == 'refused'")
        span.danger-text
          | {{ $t('.proposals.status.refused') }}

        router-link.mt-1.mb-0.button.ml-1(:to="showPath")
          | {{ $t('.proposals.buttons.view') }}

      .proposal-actions.mt-1(v-else-if="proposal.status == 'accepted'")
        span.success-text
          span.span-inline-label {{ $t('.status') }}
          i.fa.fa-star.mr-1
          | {{ $t('.proposals.status.accepted') }}

        router-link.mt-1.mb-0.button.ml-1(:to="showPath")
          | {{ $t('.proposals.buttons.view') }}

      .proposal-actions.mt-1(v-else-if="proposal.status == 'failure'")
        div.danger-text.mb-1
          | {{ $t('.proposals.status.failure') }}

        router-link.mt-1.mb-0.button.ml-1(:to="showPath")
          | {{ $t('.proposals.buttons.view') }}

      .proposal-actions.mt-1(v-else-if="seeWithDetails")
        router-link.mt-1.mb-0.button(:to="showPath")
          | {{ $t('.proposals.buttons.view') }}

    accept-proposal-overlay(:showOverlay="showAcceptOverlay", :item="acceptOverlayItem", @closeOverlay="showAcceptOverlay = false", @success="successAccept", :routeName="routeName")

    refuse-proposal-overlay(:showOverlay="showRefuseOverlay", :item="refuseOverlayItem", @closeOverlay="showRefuseOverlay = false", @success="successRefuse", :routeName="routeName")

</template>

<script>
  import AcceptProposalOverlay from './accept-proposal-overlay'
  import RefuseProposalOverlay from './refuse-proposal-overlay'

  export default {
    props: {
      bidding: { type: Object },
      proposal: { type: Object },
      pathName: { type: String, default: 'proposal' },
      index: { type: Number, default: 0 }
    },

    components: {
      AcceptProposalOverlay,
      RefuseProposalOverlay
    },

    computed: {
      routeName() {
        return this.pathName == 'proposal' ? 'lot_proposals' : 'proposals'
      },

      showPath() {
        return { name: this.pathName, params: { id: this.proposal.id } }
      },

      seeWithDetails() {
        return this.defaultBiddingStatus
      },

      defaultBiddingStatus() {
        return _.includes(this.allowedBiddingStatus, this.bidding.status)
      },

      allowedBiddingStatus() {
        return ['under_review', 'draw', 'finnished', 'failure', 'reopened']
      },

    },

    data() {
      return {
        i18nScope: 'biddings.lots.proposals._index.proposal',
        acceptOverlayItem: null,
        showAcceptOverlay: false,
        refuseOverlayItem: null,
        showRefuseOverlay: false,
        comment: '',
        errors: {},

        // buttons
        accepting: false,
        refusing: false,

      }
    },

    methods: {
      toggleAcceptOverlay(proposal) {
        this.acceptOverlayItem = proposal
        this.showAcceptOverlay = true
      },

      toggleRefuseOverlay(proposal) {
        this.refuseOverlayItem = proposal
        this.showRefuseOverlay = true
      },

      successAccept() {
        this.showAcceptOverlay = false
        this.$emit('successAccept')
      },

      successRefuse() {
        this.showRefuseOverlay = false
        this.$emit('successRefuse')
      },
    }
  }

</script>

