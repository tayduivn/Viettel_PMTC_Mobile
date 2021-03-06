// @flow
/* eslint-disable react/jsx-closing-tag-location */
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  LayoutAnimation,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { connect } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PickerDate from '../../../../common/Picker/PickerDate';
import { setIsHideGroupStatement } from '../../../../actions/statement';
import R from '../../../../assets/R';
import { FONT_TITLE } from '../../../../config/constants';
import moment from 'moment';
import {
  HEIGHTXD,
  getFontXD,
  WIDTHXD,
  getWidth,
  getLineHeightXD
} from '../../../../config/Function';
import { redStar } from 'common/Require';

class ItemDifferentLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // expanded: true,
      proposalDate: moment(new Date()).format('DD/MM/YYYY'),
      warningEmail: '',
      approveDate: moment(new Date()).format('DD/MM/YYYY'),
    };
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
    this.props.setIsHideGroupStatement({ isHideDifferentLine: !this.props.isHideDifferentLine })
  };

  componentDidMount() {
    const { dataStatementLine } = this.props;
    if (dataStatementLine) {
      this.setState({
        proposalDate: dataStatementLine.proposalDate,
        warningEmail: dataStatementLine.warningEmail,
        approveDate: dataStatementLine.approveDate,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataStatementLine) {
      if (nextProps.dataStatementLine.approveDate !== this.state.proposalDate) this.setState({ proposalDate: nextProps.dataStatementLine.proposalDate })
      if (nextProps.dataStatementLine.warningEmail !== this.state.warningEmail) this.setState({ warningEmail: nextProps.dataStatementLine.warningEmail })
      if (nextProps.dataStatementLine.approveDate !== this.state.approveDate) this.setState({ approveDate: nextProps.dataStatementLine.approveDate })
    }
  }

  onWarningEmail = (text) => {
    this.setState({ warningEmail: text });
  }

  render() {
    const { item, dataStatementLine, isHideDifferentLine } = this.props;
    const { proposalDate, warningEmail, approveDate } = this.state;
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={this.changeLayout}
          style={[
            styles.flexTitle,
            { borderBottomWidth: isHideDifferentLine === true ? 0.3 : 0 }
          ]}
        >
          <Text style={styles.title}>TH??NG TIN KH??C</Text>
          {isHideDifferentLine === true ? (
            <Ionicons
              name="ios-arrow-down"
              size={WIDTHXD(50)}
              color={R.colors.iconGray}
            />
          ) : (
              <Ionicons
                name="ios-arrow-forward"
                size={WIDTHXD(50)}
                color={R.colors.iconGray}
              />
            )}
        </TouchableOpacity>
        {this.props.detail && isHideDifferentLine && (
          <View
            style={{
              marginBottom: HEIGHTXD(40)
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: WIDTHXD(34),
                marginTop: HEIGHTXD(40)
              }}
            >
              <View style={{ flex: 1, flexDirection: "row" }}>
                <Text style={styles.label}>{`Ng??y ????? ngh??? quy???t to??n`}{redStar()}</Text>
              </View>
              <PickerDate
                width={WIDTHXD(342)}
                onValueChange={date => {
                  this.setState({ proposalDate: date });
                }}
                value={proposalDate}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: WIDTHXD(34),
                marginTop: HEIGHTXD(40)
              }}
            >
              <View style={{ flex: 1, flexDirection: "row" }}>
                <Text style={styles.label}>Ng??y quy???t to??n ???????c duy???t</Text>
              </View>
              <View pointerEvents="none" >
                <PickerDate
                  width={WIDTHXD(342)}
                  onValueChange={date => {
                    this.setState({ approveDate: date });
                  }}
                  value={approveDate}
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: WIDTHXD(34),
                marginTop: HEIGHTXD(40),
              }}
            >
              <View style={{ flex: 1, flexDirection: "row" }}>
                <Text style={styles.label}>Email nh???n c???nh b??o</Text>
              </View>
              <View style={[styles.borderTextA, { marginLeft: WIDTHXD(100) }]}>
                <View style={[styles.borderTextChil]}>
                  <TextInput
                    onChangeText={this.onWarningEmail}
                    value={warningEmail}
                    style={styles.deNghi}
                  />
                </View>
              </View>
            </View>

          </View>
        )}
      </View>
    );
  }
}



function mapStateToProps(state) {
  return {
    isHideDifferentLine: state.statementRuducer.isHideDifferentLine,
  };
}
export default connect(mapStateToProps, {
  setIsHideGroupStatement
}, null, { forwardRef: true })(ItemDifferentLine);

const styles = StyleSheet.create({
  container: {
    backgroundColor: R.colors.white,
    width: getWidth()
    // borderRadius: WIDTHXD(30),
  },
  borderTextA: {
    flex: 1,
    height: HEIGHTXD(100),
    justifyContent: 'center',
  },
  borderTextChil: {
    borderBottomWidth: 1,
    borderColor: R.colors.colorBackground,
  },
  deNghi: {
    fontFamily: R.fonts.RobotoRegular,
    fontSize: getFontXD(42),
    padding: 0,
    textAlign: 'right',
    color: R.colors.black0
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  flexTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HEIGHTXD(37),
    borderBottomColor: R.colors.iconGray,
    paddingLeft: WIDTHXD(30),
    paddingRight: WIDTHXD(59.76)
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
  wrapperText: {
    width: WIDTHXD(659),
    borderRadius: HEIGHTXD(20),
    paddingHorizontal: WIDTHXD(8),
    marginLeft: WIDTHXD(45),
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: R.colors.blue255,
    height: HEIGHTXD(99)
  },
  label: {
    fontSize: getFontXD(FONT_TITLE),
    fontFamily: R.fonts.RobotoRegular,
    color: R.colors.label,
    alignSelf: "center",
  },
  line: {
    height: HEIGHTXD(235),
    position: 'absolute',
    width: WIDTHXD(4),
    right: WIDTHXD(330),
    bottom: HEIGHTXD(36),
    backgroundColor: R.colors.colorBackground,
    flex: 1
  },
  type: {
    width: WIDTHXD(320),
    marginLeft: WIDTHXD(60),
    paddingBottom: HEIGHTXD(20),
    fontFamily: R.fonts.RobotoRegular,
    color: R.colors.color777,
    fontSize: getFontXD(36)
  },
  borderText: {
    flex: 0,
    borderBottomWidth: 1,
    borderColor: R.colors.colorBackground
  },
  duocDuyet: {
    width: getWidth() / 5,
    textAlign: 'right',
    marginRight: WIDTHXD(60),
    paddingBottom: HEIGHTXD(20),
    fontFamily: R.fonts.RobotoRegular,
    color: R.colors.color777,
    fontSize: getFontXD(36)
  },
  leftTitle: {
    fontFamily: R.fonts.RobotoMedium,
    fontSize: getFontXD(36)
  },
  rightTitle: {
    marginRight: WIDTHXD(50),
    fontFamily: R.fonts.RobotoMedium,
    fontSize: getFontXD(36)
  }
});
