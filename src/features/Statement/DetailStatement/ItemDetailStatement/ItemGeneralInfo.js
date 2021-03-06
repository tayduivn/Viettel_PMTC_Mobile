import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  LayoutAnimation,
  TouchableOpacity,
  Platform,
  UIManager
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import _ from 'lodash';
// import PickerItem from '../../ItemViews/PickerItem';
import PickerItem from '../../../AdvanceRequest/common/ItemPicker';
import PickerDate from '../../../../common/Picker/PickerDate';
import R from '../../../../assets/R';
import {
  getFontXD,
  WIDTHXD,
  HEIGHTXD,
  getWidth,
  getLineHeightXD
} from '../../../../config/Function';
import { connect } from 'react-redux';
import { setIsHideGroupStatement } from '../../../../actions/statement';
import AutoCompleteModal from '../../ItemViews/AutoCompleteModal';
import { getCategory } from '../../../../apis/Functions/statement';
import CheckBox from '../../../../common/Picker/CheckBox';
import { FONT_TITLE } from '../../../../config/constants';
import { redStar } from 'common/Require';

class ItemGeneralInfo extends Component {
  partnerComplete = React.createRef();

  departmentComplete = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      resultCategory: [],
      cStatementCategoryId: 0,
      cBpartnerId: 0,
      cDepartmentId: 0,
      cControlDepartmentId: 0,
      cControlDepartmentName: '',
      description: '',
      transDate: '',
      documentNo: '',
      statementInfo: null,
      isSponsor: false,
      isnotoverallow: false
    };
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  async componentDidMount() {
    await this.getCategory();
    const { statementInfo } = this.props;
    if (statementInfo) {
      this.setState({
        statementInfo,
        description: statementInfo.description,
        isSponsor: this.convertBool(statementInfo.isSponsor),
        isnotoverallow: this.convertBool(statementInfo.isnotoverallow),
        cBpartnerId: statementInfo.cBpartnerId,
        cDepartmentId: statementInfo.cDepartmentId,
        cControlDepartmentId: statementInfo.cControlDepartmentId,
        cControlDepartmentName: statementInfo.cControlDepartmentName,
        cStatementCategoryId: statementInfo.cStatementCategoryId,
        transDate: statementInfo.transDate,
        documentNo: statementInfo.documentNo
      });
    }
  }

  changePartner = item => {
    this.setState({ cBpartnerId: item.cBpartnerId });
  };

  changeDepartment = item => {
    this.setState({ cControlDepartmentId: item.cDepartmentId, cControlDepartmentName:  item.value});
  };

  onChangeNoiDung = (text: string) => {
    this.setState({ description: text });
  };

  getCategory = async () => {
    const body = {
      isSize: true,
      adOrgId: 1000432,
      name: this.state.valueSearch
    };
    const response = await getCategory(body);
    if (response && response.status === 200) {
      this.setState({ resultCategory: this._convertListStatement(response.data) });
    }
  };

  _convertListStatement = data => {
    let result = []
    _.forEach(data, item => {
      result.push({ name: item.text, value: item.cstatementCategoryId })
    })
    return result
  }

  changeLayout = () => {
    LayoutAnimation.configureNext({
      duration: 500,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleY,
        springDamping: 1.7
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 1.7
      }
    });
    this.props.setIsHideGroupStatement({ isHideGeneralInfo: !this.props.isHideGeneralInfo });
  };

  onChangeSponsor = value => {
    this.setState({ isSponsor: value });
  };

  onChangeOverallow = value => {
    this.setState({ isnotoverallow: value });
  };

  convertBool = value => {
    if (value === 'Y') {
      return true;
    }
    return false;
  };

  render() {
    const {
      description,
      transDate,
      isSponsor,
      isnotoverallow,
      documentNo,
      resultCategory
    } = this.state;
    const { statementInfo,
      isHideGeneralInfo } = this.props;
    const cStatementCategoryId = this.state.cStatementCategoryId ? this.state.cStatementCategoryId : ''
    let id = cStatementCategoryId || ''
    _.forEach(this.state.resultCategory, (item, index) => {
      if (item.value === cStatementCategoryId) id = index
    })
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={this.changeLayout}
          style={[
            styles.flexTitle,
            { borderBottomWidth: isHideGeneralInfo === true ? 0.3 : 0 }
          ]}
        >
          <Text style={styles.title}>Th??ng tin chung</Text>
          {isHideGeneralInfo && (
            <Ionicons
              name="ios-arrow-down"
              size={WIDTHXD(50)}
              color={R.colors.iconGray}
            />
          )}
          {!isHideGeneralInfo && (
            <Ionicons
              name="ios-arrow-forward"
              size={WIDTHXD(50)}
              color={R.colors.iconGray}
            />
          )}
        </TouchableOpacity>
        {isHideGeneralInfo && (
          <View
            style={{
              paddingLeft: WIDTHXD(30),
              paddingRight: WIDTHXD(31),
            }}
          >
            <View
              style={[
                styles.flexColumn,
                { alignItems: 'flex-start', marginTop: HEIGHTXD(40) }
              ]}
            >
              <View style={styles.flexRow}>
                <Text style={styles.label}>S?????ch???ng??t???</Text>
                <Text style={{
                  fontSize: getFontXD(42),
                  fontFamily: R.fonts.RobotoRegular,
                  marginLeft: WIDTHXD(113)
                }}>
                  {documentNo}</Text>
              </View>
            </View>
            <View
              style={[
                styles.flexColumn,
                { alignItems: 'flex-start', marginTop: HEIGHTXD(40) }
              ]}
            >
              <Text style={styles.label}>Ng?????i y??u c???u</Text>
              <AutoCompleteModal
                id={this.state.cBpartnerId}
                ref={this.partnerComplete}
                onChange={this.changePartner}
                title="Ng?????i y??u c???u"
                keyApi="partner"
                name={
                  statementInfo
                  && statementInfo.cBpartnerName
                  && statementInfo.cBpartnerName
                }
              />
            </View>
            <View
              style={[
                styles.flexColumn,
                { alignItems: 'flex-start', marginTop: HEIGHTXD(40) }
              ]}
            >
              <Text style={styles.label}>{`Ph??ng ban ki???m so??t CP`}{redStar()}</Text>
              <AutoCompleteModal
                id={this.state.cControlDepartmentId}
                ref={this.departmentComplete}
                onChange={this.changeDepartment}
                title="Ph??ng ban ki???m so??t"
                keyApi="departmentFull"
                name={
                  statementInfo
                  && statementInfo.cControlDepartmentName
                }
              />
            </View>
            <View style={[styles.flexRow, { marginTop: HEIGHTXD(40) }]}>
              <View style={styles.flexColumn}>
                <Text style={[styles.label, { marginBottom: HEIGHTXD(11) }]}>Lo???i t??? tr??nh</Text>
                <PickerItem
                  width={WIDTHXD(692)}
                  data={this.state.resultCategory}
                  value={cStatementCategoryId}
                  id={cStatementCategoryId}
                  onValueChange={(index, itemChild) => {
                    this.setState({ cStatementCategoryId: itemChild.value })
                  }}
                />
                {/* <PickerItem
width={WIDTHXD(692)}
data={this.state.resultCategory}
value={cStatementCategoryId}
onValueChange={itemValue => {
const itemTmp = _.find(this.state.resultCategory, {
fwmodelId: itemValue
});
this.setState({
cStatementCategoryId: itemTmp && itemTmp.fwmodelId
});
}} */}
              </View>
              <View style={[styles.flexColumn, { alignItems: 'flex-start' }]}>
                <Text style={[styles.label, { marginBottom: HEIGHTXD(11) }]}>Ng??y l???p</Text>
                <PickerDate
                  value={transDate}
                  width={WIDTHXD(342)}
                  onValueChange={date => {
                    this.setState({ transDate: date });
                  }}
                />
              </View>
            </View>
            <View style={[styles.flexColumn, styles.lastItem]}>
              <TextInput
                maxLength={250}
                multiline
                value={description}
                onChangeText={this.onChangeNoiDung}
                placeholder="Nh???p n???i dung"
                style={styles.formEnterInfo}
              />
            </View>
            <CheckBox
              value={isSponsor}
              textStyle={{ color: 'black', fontSize: getFontXD(42) }}
              containerStyle={{ margin: 0, paddingVertical: 0 }}
              title="Chi c??c ho???t ?????ng t??i tr???, qu??? ph??c l???i"
              onValueChange={this.onChangeSponsor}
            />
            <CheckBox
              value={isnotoverallow}
              textStyle={{ color: 'black', fontSize: getFontXD(42) }}
              containerStyle={{ margin: HEIGHTXD(40), paddingVertical: 0 }}
              title="Kh??ng v?????t qu?? quy???t to??n"
              onValueChange={this.onChangeOverallow}
            />
          </View>
        )}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    isHideGeneralInfo: state.statementRuducer.isHideGeneralInfo,
  };
}
export default connect(mapStateToProps, {
  setIsHideGroupStatement
}, null, { forwardRef: true })(ItemGeneralInfo);


const styles = StyleSheet.create({
  container: {
    backgroundColor: R.colors.white,
    width: getWidth(),
    // borderRadius: WIDTHXD(30),
  },
  flexTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HEIGHTXD(37),
    borderBottomColor: R.colors.iconGray,
    paddingLeft: WIDTHXD(30),
    paddingRight: WIDTHXD(66)
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: R.colors.iconGray
  },
  flexColumn: {
    flexDirection: 'column'
  },
  title: {
    fontSize: getFontXD(42),
    lineHeight: getLineHeightXD(56),
    fontFamily: R.fonts.RobotoBold,
    color: R.colors.colorMain,
    textTransform: 'uppercase'
  },
  formEnterInfo: {
    textAlignVertical: 'top',
    paddingHorizontal: WIDTHXD(36),
    minHeight:??HEIGHTXD(220),
    width: WIDTHXD(1064),
    marginTop: HEIGHTXD(30),
    borderColor: R.colors.borderGray,
    borderWidth: 0.3,
    borderRadius: WIDTHXD(20),
    fontSize: getFontXD(42),
    fontFamily: R.fonts.RobotoRegular,
    color: R.colors.black0
  },
  wrapperText: {
    width: WIDTHXD(352),
    paddingHorizontal: WIDTHXD(36),
    borderRadius: HEIGHTXD(20),
    height: HEIGHTXD(99),
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 0.3,
    borderColor: R.colors.iconGray
  },
  lastItem: {
    alignItems: 'flex-start',
    marginBottom: HEIGHTXD(40),
    marginTop: HEIGHTXD(40)
  },
  label: {
    fontSize: getFontXD(R.fontsize.lableFieldTextSize),
    fontFamily: R.fonts.RobotoRegular,
    color: R.colors.label,
  },
  content: {
    fontSize: getFontXD(R.fontsize.contentFieldTextSize),
    fontFamily: R.fonts.RobotoRegular,
    fontSize: getFontXD(42),
    color: R.colors.black0
  }
});