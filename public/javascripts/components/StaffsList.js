const staffsListTemplate = `
<div class="panel panel-default" id="programsList">
    <div class="panel-heading">
        <h4>Available Staff</h4>
    </div>
    <div class="panel-body">
        <table class="table table-sm table-hover table-striped">
            <thead>
                <tr>
                    <th>Member Address</th>
                    <th>Name</th>
                    <th>Since</th>
                    <th>Permissions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="staff in staffs">
                    <td>{{staff.memberAddress}}</td>
                    <td>{{staff.name}}</td>
                    <td>{{staff.memberSince|toDate}}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" @click="loadPermissionsModal(staff)">
                            <i class="fa fa-pencil"></i> Manage
                        </button>
                    </td>
                </tr>
                <tr v-if="staffs.length == 0">
                    <td colspan="4">
                        {{empty_message}}
                    </td>
                </tr>
            </tbody>
        </table>
        
        <!-- Manage user permissions -->
        <b-modal v-model="showPermissionModal" title="Update Permissions" v-if="active_staff">
            <h5>{{active_staff.name}} ({{active_staff.memberAddress}})</h5>
            <ul class="list-unstyled">
                <li v-for="permission in permissions">
                    <label>
                        <input type="checkbox" name="permission" v-model="active_staff.permissions" :value="permission.id"> {{permission.label}}
                    </label>
                </li>
            </ul>
            <div slot="modal-footer" class="w-100">
                <b-btn size="sm" class="float-right" variant="primary" @click="savePermission()">Save changes</b-btn>
                <b-btn size="sm" class="float-right" variant="default" @click="showPermissionModal=false">
                    Close
                </b-btn>
            </div>
        </b-modal>
    </div>
</div>`;
Vue.component('staffs-list', {
    template: staffsListTemplate,
    data () {
        return {
            staffs: [],
            active_staff: null,
            showPermissionModal: false,
            permissions: [
                { id:0, name: 'CanEnrollCandidate', label: 'Can Enroll Candidate'},
                { id:1, name: 'CanUpdateProgram', label: 'Can Update Program'},
                { id:2, name: 'CanUpdateUnits', label: 'Can Update Units'},
                { id:3, name: 'CanUpdateStaff', label: 'Can Update Staff'},
                { id:4, name: 'CanClearCandidate', label: 'Can Clear Candidate'},
                { id:5, name: 'CanRegisterCandidateUnits', label: 'Can Register Candidate Units'},
                { id:6, name: 'CanMarkUnits', label: 'Can Mark Units'},
                { id:7, name: 'CanUpdateFees', label: 'Can Update Fees'}
            ],
            empty_message: 'Loading records ..'
        }
    },
    created: function() {
        this.getStaffs();
    },
    filters: {
        toDate: function (timestamp) {
            try {
                return moment(timestamp, 'x').format('MMM Do, YYYY');
            } catch (ex) {
                console.log('Date error', ex);
            }
        }
    },
    methods: {
        getStaffs: function() {
            var self = this;
            App.showProcessing();
            axios.get('api/get-staffs')
              .then(function (response) {
                console.log(response);
                self.staffs = response.data.detail;
                App.hideProcessing();
                self.empty_message = 'No record found';
              })
              .catch(function (error) {
                const err = error.response.data;
                App.notify(err.detail, 'danger');
                App.hideProcessing();
                self.empty_message = 'Problem experienced while loading records';
              });
        },
        loadPermissionsModal: function(staff) {
            if (staff) {
                this.active_staff = staff;
                this.showPermissionModal = true;
            }
        },
        savePermission: function() {
            var self = this;
            App.showProcessing();
            var payload = this.active_staff;
            payload.user = store.state.user;

            axios.post('api/update-staff-permissions', payload)
              .then(function (response) {
                console.log(response);
                App.notify('Permission updated', 'success');
                App.hideProcessing();
                self.showPermissionModal = false;
              })
              .catch(function (error) {
                const err = error.response.data;
                App.notify(err.detail, 'danger');
                App.hideProcessing();
              });
        }
    }
});