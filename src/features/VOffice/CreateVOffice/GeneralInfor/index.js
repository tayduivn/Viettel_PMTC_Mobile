import React, { Component } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import apiVOffice from 'apis/Functions/vOffice'
import _ from 'lodash'
import i18n from 'assets/languages/i18n';
import { connect } from 'react-redux'
import { LoadingComponent } from '../../../../common/Loading/LoadingComponent';
import BottomMenu from './ItemViews/BottomMenu';
import { showAlert, TYPE } from '../../../../common/DropdownAlert';
import R from '../../../../assets/R';
import { HEIGHTXD, WIDTHXD, checkFormatArray } from '../../../../config/Function';
import ItemGeneralInfo from './ItemViews/ItemGeneralInfo';
import ItemMoneyInfo from './ItemViews/ItemMoneyInfo';
import Confirm from '../../../../common/ModalConfirm/Confirm';
import dataVOffice from './datainvoice'
import vOffice from 'apis/Functions/vOffice';
import global from '../../global';

class GeneralInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      reRender: false,
      showLoadingCtn: false,
      isNext: false,
      vOffice: {

      },
    };
    this.dataItem = JSON.parse(JSON.stringify(dataVOffice))
    this.dayToDueDate = 0
    this.cDocumentsignId = 0
    this.createSuccess = false
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
      enable: false,
    },
    {
      name: i18n.t('ATTACK_T'),
      iconName: R.images.voffice.attach,
      enable: false
    },
  ]

  componentDidMount() {
    const { isEdit, userData } = this.props
    this.cDocumentsignId = this.props.cDocumentsignId;
    setTimeout(() => { this.setState({ loading: false }) }, 100)
    if (isEdit) {
      this._loadData()

    } else {
      this.dataItem.adOrgId = userData.loggedIn.adOrgId
      this.dataItem.cDepartmentId = userData.loggedIn.adUserDepartmentId
      this.dataItem.createdby = userData.adUserId
      this.dataItem.updatedby = userData.adUserId
      this.vofficeBackup = JSON.parse(JSON.stringify(this.dataItem));
    }
    this.props.setCheckInformation && this.props.setCheckInformation(() => this._checkInformation());

    // data does not load when default tab is 0, try to reload data at parent component
    this.props.setLoadData && this.props.setLoadData((cDocumentsignId) => {
      this.cDocumentsignId = cDocumentsignId;
      this._loadData()
    });

    // setDataHaveChange 
    this.props.setDataHaveChange && this.props.setDataHaveChange(() => this.haveChange());

    this.props.setRollbackVOffice && this.props.setRollbackVOffice(() => {
      this.dataItem = JSON.parse(JSON.stringify(this.vofficeBackup));
      // console.log('rollback dataItem', this.dataItem.signcode, this.dataItem.documentcode);
      this._reRender();
    });
  }

  haveChange = () => {
    if (!this.vofficeBackup) return false;
    if (!this.dataItem) return false;

    console.log('vofficeBackup', this.vofficeBackup.signcode, this.vofficeBackup.documentcode);
    console.log('dataItem', this.dataItem.signcode, this.dataItem.documentcode);
    return JSON.stringify(this.vofficeBackup) !== JSON.stringify(this.dataItem);
  }

  _reRender = () => {
    this.setState({ reRender: !this.state.reRender })
  }

  _loadData = () => {
    let { cDocumentsignId } = this;
    // console.log('cDocumentsignId', cDocumentsignId)

    let body = { id: cDocumentsignId }
    this.setState({
      showLoadingCtn: true
    }, async () => {
      // this.props.nextToDetail()
      let resDetail = await apiVOffice.getDetailsVOffice(body)
      // console.log('resDetail', resDetail)
      if (resDetail && resDetail.data) {
        let dataItem = resDetail.data;


        // fill doc status name
        switch (dataItem.docstatus) {
          case 'DR':
            dataItem.docstatusName = 'Nh??p';
            break;
          case 'CO':
            dataItem.docstatusName = 'Ho??n th??nh';
            break;
          default:
            dataItem.docstatusName = 'Nh??p';
            break;
        }

        // fill sign status name
        switch (dataItem.approvalstatus) {
          case "1":
            dataItem.approvalstatusName = "V??n thu t??? ch???i";
            break;
          case "2":
            dataItem.approvalstatusName = "L??nh ?????o t??? ch???i";
            break;
          case "3":
            dataItem.approvalstatusName = "???? ph?? duy???t";
            break;
          case "4":
            dataItem.approvalstatusName = "H???y lu???ng";
            break;
          case "5":
            dataItem.approvalstatusName = "???? ban h??nh";
            break;
          case "10":
            dataItem.approvalstatusName = "Ch??? k??";
            break;
          default:
            dataItem.approvalstatusName = "Ch??? k??";
            break;
        }

        // enable or disable edit
        dataItem.viewOnly = resDetail.data.docstatus === 'CO' || resDetail.data.createdby !== this.props.userData.adUserId;
        this.dataItem = dataItem;
        this.vofficeBackup = JSON.parse(JSON.stringify(this.dataItem));

        this.setState({ vOffice: resDetail.data });

        // enable CO and Attach button
        this.menu[1].name = (resDetail.data.docstatus === 'CO') ? 'RA' : 'CO';
        this.refreshBottomMenu();
      }
      this.setState({ showLoadingCtn: false })
    })
  }

  _checkInformation = () => {
    let { voucherno, password, cDoctypeId, signcode, titlesign, areacode, priority } = this.dataItem
    let arrayTitleRequire = ['S??? ch???ng t??? k??', 'M???t kh???u', 'K?? hi???u v??n b???n', 'Ti??u ????? tr??nh k??', 'L??nh v???c', '????? ??u ti??n']
    let arrayRequire = [voucherno, password, signcode, titlesign, areacode, priority];
    // console.log(this.dataItem);

    let isCorrect = checkFormatArray(arrayRequire)
    if (isCorrect === true) {
      this._onCompleteForm()
    } else {
      showAlert(TYPE.WARN, 'Th??ng b??o', `Vui l??ng ??i???n ${arrayTitleRequire[isCorrect] ? arrayTitleRequire[isCorrect] : '?????y ????? th??ng tin'}`)
    }
  }

  _onCompleteForm = async () => {
    const { isEdit, nextToDetail, refreshData, setcDocumentsignId } = this.props
    const { isNext } = this.state
    try {
      // console.log(this.dataItem);
      this.setState({ showLoadingCtn: true }, async () => {
        const response = isEdit ? (await apiVOffice.updateVOffice(this.dataItem)) : (await apiVOffice.createVOffice(this.dataItem));
        // console.log(response)

        if (response && response.status === 200) {
          showAlert(TYPE.SUCCESS, 'Th??ng b??o', isEdit ? 'C???p nh???t tr??nh k?? VOffice th??nh c??ng' : 'T???o tr??nh k?? VOffice th??nh c??ng');
          this.createSuccess = true
          this.cDocumentsignId = response.data
          // setcDocumentsignId(this.cDocumentsignId)
          if (isNext) {
            nextToDetail()
          }
          // this._onSuccess()
        } else {
          showAlert(TYPE.ERROR, 'Th??ng b??o', isEdit ? 'S???a tr??nh k?? VOffice th???t b???i' : 'T???o tr??nh k?? VOffice th???t b???i');
        }
        this.setState({ showLoadingCtn: false })
        refreshData()
        this._loadData()
      })
    } catch (err) {
      showAlert(TYPE.ERROR, 'Th??ng b??o', 'T???o tr??nh k?? VOffice th???t b???i')
    }
    this.setState({ isSent: true })
  }

  _onChangeBottomMenu = (index) => {
    if (this.state.showLoadingCtn) return;

    if (index === 0) {
      // not show confirm modal when save (customer feedback)
      // this.ConfirmPopup.setModalVisible(true);
      this._checkInformation();
    }
    if (index === 1) {
      // B???n ghi c?? tr???ng th??i k?? = Ch??a k?? ho???c Ch??? k??
      if (this.menu[1].name === 'RA' && this.dataItem.approvalstatus !== '10') {
        showAlert(TYPE.ERROR, 'Th??ng b??o', 'Ch??? ???????c RA khi t??i li???u ??? tr???ng th??i ch??a k?? ho???c ch??? k??');
        return;
      }

      this.menu[1].name = this.menu[1].name === 'CO' ? 'RA' : 'CO';
      // update buttons when status change
      this.refreshBottomMenu();

      this.setState({ showLoadingCtn: true }, async () => {
        try {
          // request api to change document status
          if (this.menu[1].name === 'RA') {
            var response = await vOffice.CO({
              "ad_table_id": '1001735',
              "record_id": this.dataItem.cDocumentsignId,
              "ad_org_id": this.props.userData.loggedIn.adOrgId,
              "updatedby": this.props.userData.loggedIn.adOrgId,
            });
          } else {
            var response = await vOffice.RA({
              "ad_table_id": '1001735',
              "record_id": this.dataItem.cDocumentsignId,
              "ad_org_id": this.props.userData.loggedIn.adOrgId,
              "updatedby": this.props.userData.loggedIn.adOrgId,
              "dateAcct": moment().format('D/M/YYYY'),
              "ad_window_id": this.props.userData.loggedIn.adOrgId
            });
          }
          // console.log(response)
          if (response && response.status === 200 && !response.data.returnMessage) {
            // success
            showAlert(TYPE.SUCCESS, 'Th??ng b??o', (this.menu[1].name === 'RA') ? 'CO tr??nh k?? VOffice th??nh c??ng' : 'RA tr??nh k?? VOffice th??nh c??ng');
            this.props.refreshData();
          } else {
            // rollback
            showAlert(TYPE.ERROR, 'Th??ng b??o', response.data.returnMessage);
            this.menu[1].name = this.menu[1].name === 'CO' ? 'RA' : 'CO';
            this.refreshBottomMenu();
          }
        } catch (error) {
          // console.log(error);
          showAlert(TYPE.ERROR, 'Th??ng b??o', (this.menu[1].name === 'RA') ? 'CO tr??nh k?? VOffice th???t b???i' : 'RA tr??nh k?? VOffice th???t b???i');
          // rollback
          this.menu[1].name = this.menu[1].name === 'CO' ? 'RA' : 'CO';
          this.refreshBottomMenu();
        } finally {
          this.setState({ showLoadingCtn: false });
        }
      })
    }
    if (index === 2) {
      global.setTabIndex(1);
      setTimeout(() => {
        global.showAttachModal && global.showAttachModal();
      }, 700);
    }
  }

  refreshBottomMenu = () => {
    if (this.menu[1].name === 'CO') {
      this.menu[0].enable = true;
      this.menu[2].enable = true;
    } else {
      this.menu[0].enable = false;
      this.menu[2].enable = false;
    }
    // enable CO button if editmode
    if (this.props.isEdit) {
      this.menu[1].enable = true;
    }

    if (this.dataItem.viewOnly) {
      this.menu[0].enable = false;
      this.menu[1].enable = this.state.vOffice.createdby === this.props.userData.adUserId;
      this.menu[2].enable = false;
    }
    this._reRender();
  }

  render() {
    const { showLoadingCtn, loading, isNext, } = this.state
    const { nextToDetail, isEdit } = this.props
    if (loading) {
      return (
        <View style={styles.container}>
          <View>
            <ActivityIndicator animating color="#1C1C1C" size="large" />
          </View>
        </View>
      )
    }
    return (
      <View style={styles.container}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginTop: HEIGHTXD(30) }}>
            <ItemGeneralInfo
              self={this}
              item={this.dataItem}
            />
          </View>
          <ItemMoneyInfo
            self={this}
            item={this.dataItem}
          />

          <View style={{ marginTop: HEIGHTXD(30), paddingBottom: HEIGHTXD(180) }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (this.createSuccess) {
                  nextToDetail()
                } else {
                  this.ConfirmPopup.setModalVisible(true)
                  this.setState({ isNext: true })
                }
              }}
              style={{ alignItems: 'flex-end' }}
            >
              <View style={styles.button}>
                <Icon name="arrow-right" size={WIDTHXD(60)} color={R.colors.colorMain} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Confirm
          ref={ref => { this.ConfirmPopup = ref }}
          title="B???n c?? mu???n l??u b???n ghi n??y kh??ng ?"
          titleLeft="HU??? B???"
          titleRight="?????NG ??"
          onPressLeft={() => {
            if ((isNext && isEdit) || this.createSuccess) nextToDetail()
          }}
          onPressRight={() => {
            this.ConfirmPopup.setModalVisible(true);
            this._checkInformation()
          }}
        />
        <BottomMenu
          menu={this.menu}
          onChange={this._onChangeBottomMenu}
        />
        <LoadingComponent isLoading={showLoadingCtn} />
      </View>
    )
  }
}
function mapStateToProps(state) {
  return {
    listInvoice: state.invoiceReducer.listInvoice,
    userData: state.userReducers.userData
  }
}
export default connect(mapStateToProps, {})(GeneralInfo);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: R.colors.blueGrey51,
  },
  button: {
    marginTop: HEIGHTXD(42),
    marginBottom: HEIGHTXD(67),
    marginRight: WIDTHXD(86),
    width: WIDTHXD(137),
    height: WIDTHXD(137),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: WIDTHXD(137),
    shadowColor: '#181F4D21',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
    backgroundColor: R.colors.white
  }
})
