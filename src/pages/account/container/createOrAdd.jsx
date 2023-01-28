import React from 'react';
import './createOrAdd.less'
import '../components/message.less'
export default class CreateOrAdd extends React.Component {
  constructor(props) {
    super(props)
  }

  renderCon = () => {
    const { changeStep, step, registerData, onChangeData } = this.props;
    return <React.Fragment>
      <div className='gNextBox mTop32' onClick={() => {
        changeStep('add')
      }}>
        <h5 className='Gray Font17'>
          {_l('加入')}
          <span style={{ color: '#00BCD7' }}>{_l('已有')}</span>
          {_l('组织')}
        </h5>
        <p className='Gray_75 Font13 mTop12'>{_l('如果被告知要使用，或有同事已经在用，请选此项。')}</p>
      </div>
      { md.global.SysSettings.enableCreateProject && <div className='gNextBox mTop24 mBottom25' onClick={() => {
          changeStep('create')
        }}>
          <h5 className='Gray Font17'>
            {_l('创建')}
            <span style={{ color: '#3E4DB9' }}>{_l('新的')}</span>
            {_l('组织')}
          </h5>
          <p className='Gray_75 Font13 mTop12'>{_l('如果想为企业或组织创建账号，请选择此项。')}</p>
        </div>
      }
    </React.Fragment>
  }

  render() {
    const { changeStep, step, registerData, onChangeData } = this.props;
    return <React.Fragment>
      <div className='titleHeader'>
        <span className='mTop40 Font15 InlineBlock Hand backspaceT' onClick={() => {
          changeStep('registerName')
        }} >
          <span className="backspace"></span> {_l('返回')}
        </span>
        <div className='title mTop24'>
          { md.global.SysSettings.enableCreateProject ? _l('创建或加入组织') : _l('加入组织') }
        </div>
      </div>
      {this.renderCon()}
    </React.Fragment>
  }
}

