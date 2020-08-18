<style scoped lang="scss">

  ul {
    list-style-type: none;
    list-style: none;
  }

  .search-field {
    position: relative;

    > .fa {
      cursor: pointer;
      position: absolute;
      right: 10px;
      top: 12px;
    }
  }

  .search-container-results {
    position: absolute;
    top: 40px;
    max-height: 60vh;
    overflow: scroll;

    font-size: 14px;
    background-color: white;

    li {
      border-bottom: solid 1px #e1e1e1;
      padding: 10px 0;
    }
  }

  .search-item-badge {
    display: inline-block;
    padding: 5px 10px;
    margin-bottom: 5px;
    margin-right: 5px;

    border-radius: 18px;
    background-color: $success-color;
    color: white;
    font-size: 14px;

    word-break: break-all;
  }

  .search-container {
    position: relative;
  }

  .hint {
    font-size: 75%;
    color: gray;
  }

  .search-button-container {
    position: fixed;
    left: 0;
    bottom: 0;
    text-align: center;

    .button {
      width: 90%;
    }
  }

  .search-container-wrapper {
    padding-bottom: 40px;
  }


  .search-selected-list {
    overflow: scroll;
    max-height: 370px;
  }

</style>


<template lang="pug">

  .search-container
    .search-field
      input-field(
        type="text",
        v-model="search",
        name="search",
        :placeholder="searchPlaceholder",
        :hideLabel='true'
      )
      i.fa.fa-search

    .search-selected-list
      template(v-if="resultList.length == 0")
        .hint.text-center
          | {{ $t('biddings.invites.search_by_classification_name') }}
      template(v-else)
        span.search-item-badge(v-for="item in sortedClassificationList" @click="updateList(item)")
          i.fa.fa-close-thin.mr-1
          | {{ item.text }}

    .search-container-results.u-full-width
      ul.mb-0
        template(v-if="filteredResults.length > 0")
          li(v-for="result in filteredResults" @click="updateList(result)")
            | {{ result.text }}
        template(v-else-if="search != ''")
          li.hint.text-center
            | {{ $t('biddings.invites.no_results') }}

    .search-button-container.u-full-width
      .button.button-primary.button-apply-filter(@click="triggerSearch")
        | {{ $t('biddings.invites.apply_filter') }}

</template>


<script>

  export default {
    props: {
      results: { type: Array, default: () => [] },
      searchPlaceholder: { type: String, default: '' },
      currentResultList: { type: Array, default: () => [] },
    },

    data () {
      return {
        i18nScope: 'multipleSelectBadge',
        search: '',
        resultList: this.currentResultList
      }
    },

    computed: {
      filteredResults() {
        let search = this.search.toLowerCase().trim()

        if (!search) return []

        return this.results.filter(c => c.text.toLowerCase().indexOf(search) > -1)
      },

      sortedClassificationList() {
        return _.sortBy(this.resultList, [function(c) { return c.text }])
      },

      resultListIds() {
        return _.map(this.resultList, function(c) { return c.id })
      },
    },

    methods: {
      triggerSearch() {
        this.$emit('triggerSearch', { list: this.resultList })
      },

      updateList(aClassification) {
        if(_.includes(this.resultList, aClassification)) {
          this.resultList.splice(_.indexOf(this.resultList, aClassification), 1)
        } else {
          this.resultList.push(aClassification)
        }

        this.search = ''
      },

    }
  }

</script>

