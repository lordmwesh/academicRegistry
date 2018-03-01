const candidatesTemp = `
<div id="candidatesView">
    <ul class="nav nav-tabs" id="candidatesTab" role="tablist">
        <li class="nav-item" v-for="tab_item in tabs">
            <a class="nav-link" :class="{'active': active_tab == tab_item}" :id="tab_item+'-tab'" data-toggle="tab" @click="activateTab(tab_item)" role="tab" :ariaControls="tab_item" aria-selected="true">{{tab_item}}</a>
        </li>
    </ul>
    <div class="tab-content" id="candidatesTabContent">
        <div v-for="tab_item in tabs" class="tab-pane fade" :class="{'show active': active_tab == tab_item}" :id="tab_item" role="tabpanel" :ariaLabelledby="tab_item+'-tab'">
            <div class="my-2">
                <candidates-list v-if="active_tab == 'Candidates'"></candidates-list>
                <enroll-student-form v-if="active_tab == 'Enroll'"></enroll-student-form>
            </div>
        </div>
    </div>
</div>
`;

Vue.component('candidates', {
    template: candidatesTemp,
    data () {
        return {
            tabs: ['Candidates', 'Enroll'],
            active_tab: 'Candidates'
        }
    },
    methods: {
        activateTab: function(tab) {
            this.active_tab = tab;
        }
    }
});