const staffsTemp = `
<div id="staffsView">
    <ul class="nav nav-tabs" id="staffsTab" role="tablist">
        <li class="nav-item" v-for="tab_item in tabs">
            <a class="nav-link" :class="{'active': active_tab == tab_item}" :id="tab_item+'-tab'" data-toggle="tab" @click="activateTab(tab_item)" role="tab" :ariaControls="tab_item" aria-selected="true">{{tab_item}}</a>
        </li>
    </ul>
    <div class="tab-content" id="staffsTabContent">
        <div v-for="tab_item in tabs" class="tab-pane fade" :class="{'show active': active_tab == tab_item}" :id="tab_item" role="tabpanel" :ariaLabelledby="tab_item+'-tab'">
            <div class="my-2">
                <staffs-list v-if="active_tab == 'Staffs'"></staffs-list>
                <add-staff-form v-if="active_tab == 'New'"></add-staff-form>
            </div>
        </div>
    </div>
</div>
`;

Vue.component('staffs', {
    template: staffsTemp,
    data () {
        return {
            tabs: ['Staffs', 'New'],
            active_tab: 'Staffs'
        }
    },
    methods: {
        activateTab: function(tab) {
            this.active_tab = tab;
        }
    }
});