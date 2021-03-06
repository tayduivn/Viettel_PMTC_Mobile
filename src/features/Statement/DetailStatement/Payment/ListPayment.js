import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import moment from 'moment';
import { connect } from 'react-redux';
import _ from 'lodash';
import { setTypeOfIconStatementLine, setTypeOfIconPayment } from '../../../../actions/statement';
import i18n from '../../../../assets/languages/i18n';
import Confirm from '../../../../common/ModalConfirm/Confirm';
import { showAlert, TYPE } from '../../../../common/DropdownAlert';
import {
  getListcStatementLine,
  deleteItemStatement,
  deleteItemStatementLine,
  getPaymentStatementLine,
  duplicateStatementLine,
  findByIdStatementLine,
  updateSatementLine
} from '../../../../apis/Functions/statement';
import ItemStatement from '../../../ListStatement/ItemStatement';
import {
  HEIGHTXD,
  WIDTHXD,
  getFontXD,
  getWidth,
  convertDataStatement,
  mapTimeVNToWorld,
  getHeight
} from '../../../../config';
import ItemTrong from '../../../../common/Item/ItemTrong';
import R from '../../../../assets/R';
import PaymentInfoLine from '../ItemDetailStatement/PaymentInfoLine';
// import FakeData from './dataInvoice';
// import BottomTabAdd from './BottomTabAdd';


class PaymentInfo extends Component {
  ConfirmPopup = {};

  differentLineeRef = React.createRef();

  budgeteRef = React.createRef();

  generalInfoLineeRef = React.createRef();

  accountanteRef = React.createRef();

  menu: Array<Object>;

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      showfooter: false,
      cStatementLineId: 0,
      search: '',
      index: 0,
      loading: true,
      Firstloading: true,
      isLoadingFooter: false,
      data: [],
      reRender: false,
      bodyFilter: {},
      isSearch: false,
      adOrgId: this.props.adOrgId,
      start: 0,
      maxResult: 10,
      sortField: 'TRANS_DATE',
      sortDir: 'DESC',
      oldSearch: '',
      dataStatement: [],
      isShowDetail: false,
      dataStatementLine: {},
      itemStatementLine: {},
      body: {
        // currencyId: null,
        currencyName: null,
        adOrgId: this.props.adOrgId,
        adOrgName: null,
        adClientId: 1000000,
        adClientName: null,
        created: 1585637093426,
        createdFrom: null,
        createdTo: null,
        createdby: 10362509,
        createdbyName: null,
        updated: 1585637093426,
        updatedFrom: null,
        updatedTo: null,
        updatedby: 10362509,
        updatedbyName: null,
        description: 'T??? tr??nh kinh ph?? test them moi lan thu 2',
        isactive: 'Y',
        isDeleted: 'N',
        requestAmount: 6628475195,
        approveAmount: 6628475195,
        proposalDate: null,
        proposalDateFrom: null,
        proposalDateTo: null,
        approveDate: '31/03/2020',
        approveDateFrom: null,
        approveDateTo: null,
        warningEmail: null,
        isOutOfList: null,
        currencyRate: 1,
        qtPlanDetailId: null,
        qtPlanDetailName: null,
        planAmount: null,
        useAmount: null,
        remainAmount: null,
        isOutOfBudget: null,
        requestBeforeTaxAmount: 6.628475195e9,
        approvedBeforeTaxAmount: 6.628475195e9,
        requestTaxAmount: null,
        approvedTaxAmount: null,
        keyheader: null,
        keyline: null,
        directRelease: 'N',
        qtPlanId: null,
        qtPlanName: null,
        name: null,
        value: null,
        fwmodelId: 61362,
        logInfo:
          'Org_Value:null,Record_ID:6742029,Table_ID:1000470,Line_ID:61362,Window_ID:333,AD_Org_ID:1000000,Description:T??? tr??nh kinh ph?? test them moi,Approve_Amount:6.628.475.195,00,C_Currency_ID:null,Currency_Value:null,Currency_Rate:1',
        isSize: true,
        cCurrencyId: 234,
        cCurrencyName: null,
        cStatementId: 6742029,
        cStatementLineId: 61362,
        cBudgetId: 44,
        cCostTypeId: null,
        cPaymentScopeId: null,
        cPurposeId: null,
        cActivityId: null,
        cPlanPeriodId: null,
        cStatementName: null,
        cBudgetName: null,
        cCostTypeName: null,
        cPaymentScopeName: null,
        cPurposeName: null,
        cActivityName: null,
        cPlanPeriodName: null
      },
      menu:??[
      {
      ????name:??'L??u',
      ????iconName:??this.props.statusMenu.isSave
      ???????????R.images.iconSaveActive
      ????????:??R.images.iconSaveInActive
      },
      {
      ????name:??'CO',
      ????iconName:??this.props.statusMenu.isCOed
      ???????????R.images.iconCodActive
      ????????:??R.images.iconRadActive
      },
      {
      ????name:??'????nh??k??m',
      ????iconName:??this.props.statusMenu.isAttack
      ???????????R.images.iconAttackActive
      ????????:??R.images.iconAttackInActive
      },
      {
      ????name:??'Tr??nh??k??',
      ????iconName:??this.props.statusMenu.isSubmitd
      ???????????R.images.iconSubmitdActive
      ????????:??R.images.iconSubmitdInActive
      },
      {
      ????name:??'Phi???u??in',
      ????iconName:??this.props.statusMenu.isPrint
      ???????????R.images.iconPrintActive
      ????????:??R.images.iconPrintInActive
      }
    ]
    };
      //   this.props.setTypeOfIconPayment(0);
    this.getSearchStatement = _.debounce(this.getDataSearch, 500);
    this.dataItem = {};
  }

  onChangeBottomTab = async (index: number) => {
    if (index === 0) {
      const { body } = this.state;
      // ????????????????body.adOrgId =??'1001337',
      (body.description = this.generalInfoLineeRef.current.state.description),
      (body.currencyRate = this.generalInfoLineeRef.current.state.currencyRate),
      (body.requestTaxAmount = this.generalInfoLineeRef.current.state.requestTaxAmount),
      (body.requestBeforeTaxAmount = this.generalInfoLineeRef.current.state.requestBeforeTaxAmount),
      (body.cCurrencyId = this.generalInfoLineeRef.current.state.cCurrencyId),
      (body.cDepartmentId = this.accountanteRef.current.state.cDepartmentId),
      (body.cBpartnerId = this.accountanteRef.current.state.cBpartnerId),
      (body.cCostTypeId = this.budgeteRef.current.state.cCostTypeId),
      (body.cActivityId = this.budgeteRef.current.state.cActivityId),
      (body.proposalDate = this.differentLineeRef.current.state.proposalDate),
      (body.warningEmail = this.differentLineeRef.current.state.warningEmail);
      try {
        const response = await updateSatementLine(this.state.body);
        if (response && response.status === 200) {
          showAlert(TYPE.SUCCESS, 'Th??ng??b??o', 'C???p??nh???t??th??nh??c??ng');
        }
      } catch (error) {}
    }
    this.setState({ index });
  };

  _onDelete = async id => {
    Alert.alert(
      '',
      'B???n c?? mu???n x??a b???n ghi n??y kh??ng ?',
      [
        { text: 'H???Y B???', style: 'cancel' },
        {
          text: '?????NG ??',
          onPress: async () => {
            try {
              const response = await deleteItemStatement(id);
              if (response && response.status === 200) {
                showAlert(TYPE.SUCCESS, 'Th??ng b??o', 'X??a th??nh c??ng');
                this._onSuccess(id);
              } else {
                showAlert(TYPE.ERROR, 'Th??ng b??o', 'X??a th???t b???i');
              }
            } catch (err) {
              showAlert(TYPE.ERROR, 'Th??ng b??o', 'X??a th???t b???i');
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  setIsSearch = isSearch => {
    this.setState({ isSearch });
  };

  _onPressConfirm = async value => {
    try {
      const bodyFilter = this._convertParams(value);
      const response = await getListStatement(bodyFilter);
      if (response && response.status === 200) {
        this.setState({ dataStatement: response.data.data, bodyFilter });
      }
    } catch (err) {}
  };

  _convertParams = value => {
    const start = 0;
    const body = { maxResult: 10, start };
    _.forEach(value, (item, index) => {
      switch (index) {
        case 0:
          _.forEach(R.strings.local.TRANG_THAI_TAI_LIEU, itemChild => {
            if (itemChild.name === item) {
              body.docstatus = itemChild.id;
            }
          });
          break;
        case 1:
          _.forEach(R.strings.local.TRANG_THAI_DUYET, itemChild => {
            if (itemChild.name === item) {
              body.approveStatus = itemChild.id;
            }
          });
          break;
        case 2:
          _.forEach(R.strings.local.TRANG_THAI_KY, itemChild => {
            if (itemChild.name === item) {
              body.signerStatus = itemChild.value;
            }
          });
          break;
        default:
          break;
      }
    });
    return body;
  };

  componentDidMount = async () => {
    this.refreshData();
  };

  // componentWillMount(){
  //   this.props.setTypeOfIconPayment(0);
  // }
  _getData = async (startTmp, documentNo) => {
    const body = { cStatementId: this.props.id };
    const response = await getPaymentStatementLine(body);
    return response;
  };

  onChangeSearch = search => {
    // this.setState({ reRender: true, search })
    // this.getSearchStatement(search);
  };

  getDataSearch = async search => {
    let resStatement = await this._getData(0, search);
    if (resStatement && resStatement.status === 200) {
      this.setState({ dataStatement: resStatement.data });
      // this.setState({ dataStatement: convertDataStatement(resStatement.data.data) })
    }
  };

  refreshData = async () => {
    let resStatement = await this._getData(0, '');
    if (resStatement && resStatement.status === 200) {
      // const statementLine = convertDataStatement(resStatement.data.data);
      this.setState({ dataStatement: resStatement.data, loading: false });
    }
  };

  loadMoreData = async () => {
    let { search } = this.state;
    this.setState({ loading: true, showfooter: true }, async () => {
      let resInvoice = await this._getData(this.dataStatement.length, search);
      if (resInvoice.data) {
        if (resInvoice.total > this.dataStatement.length) {
          let dataConvert = convertDataStatement([
            ...this.dataStatement,
            ...resInvoice.data
          ]);
          this.dataStatement = dataConvert;
        }
      }
      this.setState({ loading: false, showfooter: false });
    });
  };

  renderFooter = () => (this.state.showfooter ? (
    <View style={{ height: HEIGHTXD(110) }}>
      <ActivityIndicator animating color="#1C1C1C" size="large" />
    </View>
  ) : (
    <View style={{ height: HEIGHTXD(110) }} />
  ));

  alertDelSuccess = async () => {
    const { cStatementLineId } = this.state;
    this.setState({ loading: true });
    let res = await deleteItemStatementLine(cStatementLineId);
    if (res) {
      this.setState({
        dataStatement: this.state.dataStatement.filter(
          item => item.cStatementLineId !== cStatementLineId
        )
      });
      this.setState({ loading: false });
      showAlert(
        TYPE.SUCCESS,
        i18n.t('NOTIFICATION_T'),
        i18n.t('Delete_successful')
      );
    } else {
      this.setState({ loading: false });
      showAlert(TYPE.ERROR, i18n.t('NOTIFICATION_T'), i18n.t('Delete_failed'));
    }
  };

  onPressIcon = async (indexOfIcon, index, item) => {
    if (indexOfIcon === 2) {
      this.setState({ cStatementLineId: item.cStatementLineId });
      this.ConfirmPopup.setModalVisible(true);
    } else {
      if (indexOfIcon === 0) {
        try {
          const res = await duplicateStatementLine(item.cStatementLineId);
          if (res && res.status === 200) {
            showAlert(TYPE.SUCCESS, 'Th??ng??b??o', 'Nh??n ????i th??nh c??ng');
          }
        } catch {}
      } else {
        showAlert(
          TYPE.WARN,
          i18n.t('NOTIFICATION_T'),
          i18n.t('FUCTION_UPDATE')
        );
        this.setState({ reRender: !this.state.reRender });
      }
    }
  };

  onPressItem = async (item) => {
    // this.setState({ isShowDetail: true });
    this.props.navigation.navigate('DetailPayment', {dataItem: item})
    // try{
    //   const res = await getPaymentStatementLine(id);
    //   if??(res && res.status??===??200)??{
    //     await this.setState({dataStatementLine: res.data})
    //     showAlert(TYPE.SUCCESS,??'Th??ng??b??o',??'Nh???n th??ng tin th??nh c??ng');

    //   }

    // }catch{
    // }
  };

  renderItem = ({ item, index }) => {
    let day = item.dateAcct
      ? moment(mapTimeVNToWorld(item.dateAcct)).format('D')
      : '';
    let month = item.dateAcct
      ? moment(mapTimeVNToWorld(item.dateAcct)).format('M')
      : '';
    let year = item.dateAcct
      ? moment(mapTimeVNToWorld(item.dateAcct)).format('YYYY')
      : '';
    let content = {
      adOrgName: item.adOrgName,
      documentNo: item.documentNo,
      vwamount: item.amtSource,
      status: item.description,
      vwstatus: item.status === "Y"? 'Ch??a h???ch to??n' : '???? h???ch to??n',
      cStatementLineId: item.cStatementLineId,
      cStatementId: item.cStatementId,

      adOrgId: item.adOrgId, // ????n v???
      cDocumentTypeId: item.cDocumentTypeId, // s??? ch???ng t???
      dateAcct: item.dateAcct, // Ng??y h???ch to??n
      cCurrencyId: item.cCurrencyId, // TI???n t???
      accountNo: item.accountNo,
      cCurrencyName: item.cCurrencyName,
      description: item.description // n???i dung
    };
    let color = item.status === "Y"? "#FFC107" : "#1777F1"
    this.setState({ itemStatementLine: content });
    let c = R.strings.TRANG_THAI_TO_TRING[0].color;
    return (
      <ItemStatement
        onPressItem={()=>{this.onPressItem(item)}}
        isShowMonth={item.isShowMonth}
        time={{ day, month, year }}
        content={content}
        item={item}
        index={index}
        color={color}
        colorStatus={c}
        onPressIcon={indexOfIcon => {
          this.onPressIcon(indexOfIcon, index, item);
        }}
      />
    );
  };

  render() {
    const {
      Firstloading,
      dataStatementLine,
      itemStatementLine,
      search,
      isShowDetail,
      isSearch,
      dataStatement
    } = this.state;
    return (
      <View style={styles.container}>
        <Confirm
          ref={ref => {
            this.ConfirmPopup = ref;
          }}
          title="B???n c?? mu???n x??a b???n ghi n??y kh??ng ?"
          titleLeft="HU???"
          titleRight="?????NG ??"
          onPressLeft={() => {}}
          onPressRight={() => this.alertDelSuccess()}
        />
        <View style={styles.view}>
          <FlatList
            data={dataStatement}
            extraData={dataStatement}
            renderItem={({ item, index }) => this.renderItem({ item, index })}
            ListEmptyComponent={
              !this.state.refreshing && !this.state.loading && <ItemTrong />
            }
            onEndReached={this.loadMoreData}
            ListFooterComponent={this.renderFooter}
            onRefresh={this.refreshData}
            refreshing={this.state.refreshing}
            onEndReachedThreshold={0.1}
          />
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    listInvoice: state.invoiceReducer.listInvoice,
    statusMenu: state.statementRuducer.statusMenu,
    statusStatementChil: state.statementRuducer.statusStatementChil,
    adOrgId:??state.userReducers.userData.loggedIn.adOrgId,
  };
}
export default connect(mapStateToProps, {setTypeOfIconStatementLine, setTypeOfIconPayment })(PaymentInfo);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: R.colors.colorMain
  },
  view: {
    width: getWidth(),
    flex: 1,
    height: getHeight() - HEIGHTXD(20),
    backgroundColor: R.colors.colorf1f,
    paddingTop: HEIGHTXD(30)
  },
  item: {
    marginTop: HEIGHTXD(50)
  },
  title: {
    fontSize: getFontXD(42),
    fontFamily: R.fonts.MontserratMedium
  }
});
