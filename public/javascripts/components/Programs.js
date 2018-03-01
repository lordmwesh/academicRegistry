const programsTemp = `
<div id="programsView">
    <ul class="nav nav-tabs" id="programsTab" role="tablist">
        <li class="nav-item" v-for="tab_item in tabs">
            <a class="nav-link" :class="{'active': active_tab == tab_item}" :id="tab_item+'-tab'" data-toggle="tab" @click="activateTab(tab_item)" role="tab" :ariaControls="tab_item" aria-selected="true">{{tab_item}}</a>
        </li>
    </ul>
    <div class="tab-content" id="programsTabContent">
        <div v-for="tab_item in tabs" class="tab-pane fade" :class="{'show active': active_tab == tab_item}" :id="tab_item" role="tabpanel" :ariaLabelledby="tab_item+'-tab'">
            <div class="my-2">
                <programs-list v-if="active_tab == 'Programs'"></programs-list>
                <add-program-form v-if="active_tab == 'New'"></add-program-form>
            </div>
        </div>
    </div>
</div>
`;

Vue.component('programs', {
    template: programsTemp,
    data () {
        return {
            tabs: ['Programs', 'New'],
            active_tab: 'Programs'
        }
    },
    methods: {
        activateTab: function(tab) {
            this.active_tab = tab;
        }
    }
});