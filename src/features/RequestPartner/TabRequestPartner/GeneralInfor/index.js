import React, { Component } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import R from 'assets/R'
import i18n from 'assets/languages/i18n'
import apiInvoice from 'apis/Functions/invoice'
import partner from 'apis/Functions/partner';
import { showAlert, TYPE } from 'common/DropdownAlert'
import NavigationService from 'routers/NavigationService'
import { LoadingComponent } from 'common/Loading/LoadingComponent'
import Confirm from 'common/ModalConfirm/Confirm'
import _ from 'lodash'
import { HEIGHTXD, checkFormatArray } from '../../../../config'
import GeneralInfo from './ItemGeneral'
import { dataDetailedInvoice } from './dataDetailedInvoice'
import BottomMenu from '../../../../features/VOffice/CreateVOffice/GeneralInfor/ItemViews/BottomMenu';
import ModalAttachment from 'common/FilePicker/ModalAttachment'
import axios from 'axios';
import { showLoading, hideLoading } from 'common/Loading/LoadingModal'
import { connect } from 'react-redux'
import global from '../global';

class DetailedInvoice extends Component {
  isEdit = false;

  constructor(props) {
    super(props)
    this.state = {
      reRender: false,
      showLoadingCtn: false,
      loading: false,
    }
    this.dataPartner = JSON.parse(JSON.stringify(dataDetailedInvoice))

    this.isEdit = this.props.navigation.state.params.isUpdate;

    if (this.isEdit) this.dataPartner = this.props.navigation.state.params.item
    this.disabled = this.props.navigation.state.params.disabled
    this.menu.map(x => x.enable = this.isEdit && !this.disabled);
    this.partnerBackup = JSON.parse(JSON.stringify(this.dataPartner));
  }

  componentDidMount = () => {
    if (this.props.navigation.state.params.isUpdate) this._getAdOrgName(this.dataPartner.cRequestPartnerId)
    if (this.dataPartner.docstatus === 'CO') {
      this.menu[1].name = 'RA';
    } else {
      this.menu[1].name = 'CO';
    }
    this.refreshBottomMenu();
    this.props.setCheckInformation && this.props.setCheckInformation(() => this._checkInformation());
    this.props.setDataHaveChange && this.props.setDataHaveChange(() => this.haveChange());
    this.props.setRollbackPartner && this.props.setRollbackPartner(() => {
      this.dataPartner = JSON.parse(JSON.stringify(this.partnerBackup));
      // console.log('rollback dataItem', this.dataItem.signcode, this.dataItem.documentcode);
      this._reRender();
    });
  }

  haveChange = () => {
    if (!this.partnerBackup) return false;
    if (!this.dataPartner) return false;

    return JSON.stringify(this.partnerBackup) !== JSON.stringify(this.dataPartner);
  }

  _checkInformation = () => {
    let { partnerName, address, description, taxCode, identify, adOrgId, approverId, approverName } = this.dataPartner
    let arrayTitleRequire = ['????n v???', 'T??n ?????i t?????ng', 'Ch???ng minh th?? ho???c M?? s??? thu???', '?????a ch???', 'Ng?????i nh???n', 'M?? t???']
    let arrayRequire = [adOrgId, partnerName, identify + taxCode, address, approverId, description]
    let isCorrect = checkFormatArray(arrayRequire)
    if (isCorrect === true) {
      (this.isEdit ? this._onUpdateData() : this._onCompleteForm())
    } else {
      showAlert(TYPE.WARN, 'Th??ng b??o', `Vui l??ng ??i???n ${arrayTitleRequire[isCorrect] ? arrayTitleRequire[isCorrect] : '?????y ????? th??ng tin'}`)
    }
  }

  setPartner = (partner) => {
    this.dataPartner = partner;
    const { setPartner } = this.props;
    setPartner && setPartner(partner);
    this.isEdit = true;
    this.refreshBottomMenu();
    this._reRender();
  }

  _reRender = () => this.setState({ reRender: !this.state.reRender })

  _onCompleteForm = async () => {
    try {
      showLoading();
      const response = await apiInvoice.createRequestPartne(this.dataPartner)
      if (response.data && response.data.returnMessage === null) {
        console.log('_onCompleteForm', response.data)
        this.setPartner(response.data);
        showAlert(TYPE.SUCCESS, 'Th??ng b??o', 'T???o ????? xu???t ?????i t?????ng th??nh c??ng');
      } else {
        showAlert(TYPE.ERROR, 'Th??ng b??o', 'T???o ????? xu???t ?????i t?????ng th???t b???i');
      }
      // this.props.refreshData()
      this.props.navigation.state.params.refreshData()
      // NavigationService.pop()
    } catch (err) {
      console.log(err)
      showAlert(TYPE.ERROR, 'Th??ng b??o', 'T???o ????? xu???t ?????i t?????ng th???t b???i')
    } finally {
      hideLoading();
    }
  }

  _onChangeBottomMenu = (index) => {
    if (index === 0) {
      // this.ConfirmPopup.setModalVisible(true);
      this._checkInformation();
    }
    if (index === 1) {
      // CO, RA
      this.menu[1].name = this.menu[1].name === 'CO' ? 'RA' : 'CO';

      this.refreshBottomMenu();

      this.setState({ showLoadingCtn: true }, async () => {
        try {
          // request api to change document status
          // console.log(this.dataPartner.cRequestPartnerId)
          if (this.menu[1].name === 'RA') {
            var response = await partner.CO({
              "cRequestPartnerId": this.dataPartner.cRequestPartnerId,
            });
          } else {
            // console.log('this.dataPartner.cRequestPartnerId', this.dataPartner.cRequestPartnerId)
            var response = await partner.RA({
              "cRequestPartnerId": this.dataPartner.cRequestPartnerId,
            });
          }
          // console.log(response)
          if (response && response.status === 200) {
            // success
            showAlert(TYPE.SUCCESS, 'Th??ng b??o', (this.menu[1].name === 'RA') ? 'CO ????? xu???t ?????i t?????ng th??nh c??ng' : 'RA ????? xu???t ?????i t?????ng th??nh c??ng');
            this.props.navigation.state.params.refreshData()
          } else {
            // rollback
            showAlert(TYPE.ERROR, 'Th??ng b??o', (this.menu[1].name === 'RA') ? 'CO ????? xu???t ?????i t?????ng th???t b???i' : 'RA ????? xu???t ?????i t?????ng th???t b???i');
            this.menu[1].name = this.menu[1].name === 'CO' ? 'RA' : 'CO';
            this.refreshBottomMenu();
          }
        } catch (error) {
          // console.log(error);
          showAlert(TYPE.ERROR, 'Th??ng b??o', (this.menu[1].name === 'RA') ? 'CO ????? xu???t ?????i t?????ng th???t b???i' : 'RA ????? xu???t ?????i t?????ng th???t b???i');
          // rollback
          this.menu[1].name = this.menu[1].name === 'CO' ? 'RA' : 'CO';
          this.refreshBottomMenu();
        } finally {
          this.setState({ showLoadingCtn: false });
        }
      })
    }
    if (index === 2) {
      // console.log(this.props)
      global.setTabIndex(1);
      setTimeout(() => {
        global.showAttachModal && global.showAttachModal();
      }, 700);
      // this.props.jumpTo('Attachment');
    }
  }

  refreshBottomMenu = () => {
    if (this.isEdit) {
      // status is CO, disable save and attach, CO button enable if not disable
      if (this.menu[1].name === 'RA') {
        this.menu[0].enable = !this.isEdit && !this.disabled;
        this.menu[1].enable = !this.disabled;
        this.menu[2].enable = false;
      } else {
        this.menu[0].enable = !this.disabled;
        this.menu[1].enable = !this.disabled;
        this.menu[2].enable = !this.disabled;
      }
    } else {
      this.menu[0].enable = true;
      this.menu[1].enable = false;
      this.menu[2].enable = false;
    }
    this._reRender();
  }

  _getAdOrgName = async (cRequestPartnerId) => {
    showLoading()
    try {
      let res = await apiInvoice.getIDRequestPartner(cRequestPartnerId)
      if (res.data) {
        this.dataPartner = res.data
        this.partnerBackup = JSON.parse(JSON.stringify(res.data));
        this.setState({ loading: false })
        // this._reRender()
        console.log('orgName', res.data)
      }
    } catch (error) {

    } finally {
      hideLoading();
    }
  }


  _onUpdateData = () => {
    let { partnerName, address, taxCode, identify } = this.dataPartner
    if (_.isEmpty(partnerName) || _.isEmpty(address) || _.isEmpty(taxCode) || _.isEmpty(identify)) {
      showAlert(TYPE.WARN, 'Th??ng b??o', 'B???n ch??a nh???p ?????y ????? th??ng tin.')
    } else {
      try {
        this.setState({ showLoadingCtn: true }, async () => {
          console.log('updateData', JSON.stringify(this.dataPartner))
          const response = await apiInvoice.updateRequestPartner(this.dataPartner)
          if (response && response.data && response.data.returnMessage === null) {
            console.log('_onUpdateData', response.data)
            showAlert(TYPE.SUCCESS, 'Th??ng b??o', 'C???p nh???t ????? xu???t ?????i t?????ng th??nh c??ng');
            this._getAdOrgName(this.dataPartner.cRequestPartnerId);
          } else {
            showAlert(TYPE.ERROR, 'Th??ng b??o', 'C???p nh???t ????? xu???t ?????i t?????ng th???t b???i');
          }
          // this.props.refreshData()
          this.props.navigation.state.params.refreshData()
          // NavigationService.pop()
          this.setState({ showLoadingCtn: false })
        })
      } catch (err) {
        showAlert(TYPE.ERROR, 'Th??ng b??o', 'C???p nh???t ????? xu???t ?????i t?????ng th???t b???i')
      }
    }
  }

  menu = [
    {
      name: i18n.t('SAVE_T'),
      iconName: R.images.voffice.save,
      enable: true,
    },
    {
      name: 'CO',
      iconName: R.images.voffice.co,
      enable: !this.disabled,
    },
    {
      name: i18n.t('ATTACK_T'),
      iconName: R.images.voffice.attach,
      enable: !this.disabled
    },
  ]

  render() {
    const { showLoadingCtn, loading } = this.state
    if (!loading) {
      return (
        <View style={styles.conmponent}>
          <ScrollView
            style={{ flex: 1, marginBottom: HEIGHTXD(200) }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ marginVertical: HEIGHTXD(30) }}>
              <GeneralInfo self={this} />
            </View>
          </ScrollView>
          <BottomMenu
            menu={this.menu}
            onChange={this._onChangeBottomMenu}
          />
          <Confirm
            ref={ref => { this.ConfirmPopup = ref }}
            title="B???n c?? mu???n l??u b???n ghi n??y kh??ng ?"
            titleLeft="HU??? B???"
            titleRight="?????NG ??"
            onPressLeft={() => { }}
            onPressRight={() => this._checkInformation()}
          />
          <LoadingComponent isLoading={showLoadingCtn} />
        </View>
      )
    } else return (<LoadingComponent isLoading={loading} />)
  }
}

function mapStateToProps(state) {
  return {
    userData: state.userReducers.userData
  }
}
export default connect(mapStateToProps, {})(DetailedInvoice);

const styles = StyleSheet.create({
  conmponent: {
    flex: 1,
    backgroundColor: R.colors.blueGrey51,
  }
})
