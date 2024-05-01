import React from 'react';

export const stylesheet_er = `
.overflow_ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.flex {
  -webkit-flex: 1;
  flex: 1;
  -ms-flex: 1;
}
.customErNode {
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 4px;
  color: #333;
  height: 100%;
  padding: 6px 0;
  border: 1px solid #dddddd;
  .count {
    padding: 0 16px;
  }
}
.x6-graph-svg {
  background: #f0f0f0;
}
.splitLint {
  height: 1px;
  background: #dddddd;
  border: none;
  margin: 2px 12px 6px 12px;
}
.nodeTitle {
  padding: 0 12px;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  height: 36px;
  .editIconBox {
    width: 36px;
    height: 36px;
    display: none;
    text-align: center;
    line-height: 36px;
    margin-right: -8px;
  }
}
.nodeControlItem {
  padding: 0 16px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  & > span {
    width: 100%;
    display: inline-block;
    line-height: 24px;
  }
  .icon {
    vertical-align: text-bottom;
    margin-right: 4px;
  }
}
.icon {
  width: 16px;
  height: 16px;
  fill: #757575;
  color: #757575;
}
.valignWrapper {
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
}
.Font14 {
  font-size: 14px !important;
}
.Font12 {
  font-size: 12px !important;
}
.Bold {
  font-weight: bold !important;
}
.Gray_9e {
  color: #9e9e9e !important;
}
`;

export const iconSvg = {
  letter_a: (
    <path
      d="M589.80871576 136.47530835H432.9145L136.47530835 887.52469165h172.32828145l54.63884259-144.68966388h296.43919078L711.96689815 887.52469165h172.32828057L589.77116388 136.47530835zM409.0686824 618.72411758l102.25537316-270.71575001 102.25537316 270.71575001H409.0686824z"
      p-id="121055"
    ></path>
  ),
  number_6: (
    <path
      d="M469.333333 640h85.333334v-85.333333h-85.333334z m341.333334-512H213.333333a85.589333 85.589333 0 0 0-85.333333 85.333333v597.333334a85.589333 85.589333 0 0 0 85.333333 85.333333h597.333334a85.589333 85.589333 0 0 0 85.333333-85.333333V213.333333a85.589333 85.589333 0 0 0-85.333333-85.333333z m-170.666667 256h-170.666667v85.333333h85.333334a85.333333 85.333333 0 0 1 85.333333 85.333334v85.333333a85.333333 85.333333 0 0 1-85.333333 85.333333h-85.333334a85.333333 85.333333 0 0 1-85.333333-85.333333V384a85.333333 85.333333 0 0 1 85.333333-85.333333h170.666667z"
      p-id="121197"
    ></path>
  ),
  amount_rmb: (
    <path
      d="M512 85.333333A426.666667 426.666667 0 0 0 85.333333 512a426.666667 426.666667 0 0 0 426.666667 426.666667 426.666667 426.666667 0 0 0 426.666667-426.666667A426.666667 426.666667 0 0 0 512 85.333333z m170.666667 341.333334v85.333333h-128v85.333333h128v85.333334h-128v85.333333h-85.333334v-85.333333H341.333333v-85.333334h128v-85.333333H341.333333v-85.333333h75.008L293.504 303.829333l60.330667-60.330666L512 401.706667l158.165333-158.208 60.330667 60.330666L607.658667 426.666667z"
      p-id="121339"
    ></path>
  ),
  email: (
    <path
      d="M854.016 342.016V256L512 470.016 169.984 256v86.016L512 554.026667z m0-172.032q34.005333 0 59.008 25.984t25.002667 59.989333v512q0 34.005333-25.002667 59.989334t-59.008 25.984H170.026667q-34.005333 0-59.008-25.984t-25.002667-59.989334v-512q0-34.005333 25.002667-59.989333t59.008-25.984h683.989333z"
      p-id="121481"
    ></path>
  ),
  event: (
    <path
      d="M738.133333 558.933333H512v226.133334h226.133333v-226.133334zM691.2 64v89.6H332.8V64H243.2v89.6H196.266667c-51.2 0-89.6 38.4-89.6 89.6v631.466667c0 51.2 38.4 89.6 89.6 89.6h631.466666c51.2 0 89.6-38.4 89.6-89.6V243.2c0-51.2-38.4-89.6-89.6-89.6h-46.933333V64h-89.6z m136.533333 810.666667H196.266667V379.733333h631.466666v494.933334z"
      p-id="121623"
    ></path>
  ),
  access_time: (
    <path
      d="M534.016 297.984v224l192 114.005333-32 54.016-224-136.021333v-256h64zM512 854.016q139.989333 0 240.981333-100.992t100.992-240.981333-100.992-240.981334T512 170.069333 271.018667 271.061333t-100.992 240.981334 100.992 240.981333T512 854.016z m0-768q176 0 301.013333 125.013333t125.013334 301.013334-125.013334 301.013333T512 938.069333t-301.013333-125.013333-125.013334-301.013333 125.013334-301.013334T512 86.016z"
      p-id="121765"
    ></path>
  ),
  call: (
    <path
      d="M854.016 656q18.005333 0 29.994667 11.989333t11.989333 29.994667v148.010667Q896 896 854.016 896q-297.984 0-512-214.016T128 169.984Q128 128 178.005333 128h148.010667q18.005333 0 29.994667 11.989333t11.989333 29.994667q0 77.994667 24.021333 150.016 8.021333 25.984-9.984 43.989333l-82.005333 72.021334q91.989333 192 294.016 290.005333l66.005333-84.010667q11.989333-11.989333 29.994667-11.989333 9.984 0 13.994667 2.005333 72.021333 24.021333 150.016 24.021334z"
      p-id="121907"
    ></path>
  ),
  map: (
    <path
      d="M640 809.984V304L384 214.016v505.984zM873.984 128Q896 128 896 150.016V794.026667q0 16-16 20.010666L640 896.042667l-256-89.984-228.010667 88.021333-6.016 2.005333q-22.016 0-22.016-22.016V230.058667q0-16 16-20.010667l240-82.005333 256 89.984 228.010667-88.021334z"
      p-id="122049"
    ></path>
  ),
  arrow_drop_down_circle: (
    <path
      d="M512 598.016l169.984-171.989333H341.973333z m0-512q176 0 301.013333 125.013333t125.013334 301.013334-125.013334 301.013333T512 938.069333t-301.013333-125.013333-125.013334-301.013333 125.013334-301.013334T512 86.016z"
      p-id="122333"
    ></path>
  ),
  multi_select: (
    <path
      d="M170.666667 853.333333a42.666667 42.666667 0 0 1-42.666667-42.666666v-213.333334a42.666667 42.666667 0 0 1 42.666667-42.666666h213.333333a42.666667 42.666667 0 0 1 42.666667 42.666666v213.333334a42.666667 42.666667 0 0 1-42.666667 42.666666z m42.666666-85.333333h128v-128H213.333333z m341.333334 42.666667v-85.333334h384v85.333334z m0-213.333334v-85.333333h384v85.333333zM85.333333 318.336l60.16-60.16 90.453334 90.453333 180.906666-180.906666 60.117334 60.117333L236.373333 469.333333z m469.333334 65.706667v-85.333334h384v85.333334z"
      p-id="122475"
    ></path>
  ),
  account_circle: (
    <path
      d="M512 820.010667q68.010667 0 143.018667-40.021334T768 681.984q-2.005333-56.021333-89.984-93.994667T512 549.973333t-166.016 36.992T256 681.984q38.016 57.984 112.981333 98.005333t143.018667 40.021334z m0-605.994667q-52.010667 0-89.984 38.016T384 342.016t38.016 89.984 89.984 38.016 89.984-38.016T640 342.016t-38.016-89.984T512 214.016z m0-128q176 0 301.013333 125.013333t125.013334 301.013334-125.013334 301.013333T512 938.069333t-301.013333-125.013333-125.013334-301.013333 125.013334-301.013334T512 86.016z"
      p-id="122617"
    ></path>
  ),
  department: (
    <path
      d="M810.666667 682.666667v-213.333334h-256V341.333333h128V128H341.333333v213.333333h128v128H213.333333v213.333334H85.333333v213.333333h341.333334v-213.333333H298.666667v-128h426.666666v128h-128v213.333333h341.333334v-213.333333z"
      p-id="122759"
    ></path>
  ),
  user: (
    <path
      d="M234.12736 742.74816q0-62.5664 104.81152-106.43456 86.9376-36.56192 173.06624-36.56192 84.50048 0 173.06624 36.56192 104.00256 43.8784 104.00256 106.43456v47.12448H234.1376v-47.12448zM512 512q-138.12736 0-138.12736-138.12736 0-138.93632 138.12736-138.93632t138.12736 138.93632Q650.12736 512 512 512z m-416 323.37408q0 92.62592 92.62592 92.62592h646.74816q92.62592 0 92.62592-92.62592V188.62592q0-92.62592-92.62592-92.62592H188.62592q-92.62592 0-92.62592 92.62592v646.74816z"
      p-id="122901"
    ></path>
  ),
  attachment: (
    <path
      d="M281.00096 784.9984q-115.00032 0-198.00064-80Q0 624 0 512t83.00032-191.0016q83.00032-82.00192 198.00064-82.00192h537.99936q83.99872 0 144.9984 57.99936Q1024 354.9952 1024 436.99712q0 83.00032-60.00128 140.99968-60.99968 57.99936-144.9984 57.99936H383.0016q-53.00224 0-89.99936-35.00032Q256 563.9936 256 511.99488q0-53.00224 37.00224-87.99744 37.00224-37.00224 89.99936-37.00224H768v74.99776H383.0016q-51.00032 0-51.00032 50.00192t51.00032 50.00192h435.99872q53.00224 0 90.99776-35.99872 38.00064-38.00064 38.00064-89.00096 0-51.99872-38.00064-87.99744t-90.99776-35.99872H281.00096q-83.99872 0-144.9984 58.99776Q76.00128 429.99808 76.00128 512t60.00128 140.00128q60.99968 58.99776 144.9984 58.99776H768v73.99936H281.00096z"
      p-id="123043"
    ></path>
  ),
  formula: (
    <React.Fragment>
      <path
        d="M192 870.4v-383.445333H128V397.909333h64v-20.096a221.312 221.312 0 0 1 57.386667-161.578666A179.413333 179.413333 0 0 1 373.12 170.666667a232.917333 232.917333 0 0 1 75.818667 11.733333l-8.533334 91.818667a142.464 142.464 0 0 0-50.944-8.533334c-58.965333-0.042667-78.677333 49.706667-78.677333 107.562667v24.661333h103.296v89.045334H311.552V870.4z"
        p-id="123185"
      ></path>
      <path
        d="M568.234667 397.909333l55.893333 88.96c15.573333 25.173333 29.184 48.768 42.88 73.344h2.176c13.696-26.538667 27.221333-50.645333 41.386667-75.008l52.48-87.296h130.005333l-157.866667 226.56 160.938667 245.930667h-135.594667l-57.216-94.464a1097.514667 1097.514667 0 0 1-42.666666-76.544h-2.346667c-13.653333 27.008-27.477333 51.2-42.410667 76.8l-54.826666 94.336h-131.754667l163.584-240.896-158.08-231.722667z"
        p-id="123186"
      ></path>
    </React.Fragment>
  ),
  checkbox_01: (
    <path
      d="M809.6 790.4H214.4V190.40256h427.19744V104.00256H214.4C166.4 104.00256 128 142.40256 128 190.40256v595.2c0 48 38.4 86.4 86.4 86.4h595.2c48 0 86.4-38.4 86.4-86.4V444.80512h-86.4v345.6zM339.2 411.20256L281.6 468.80256l192 192L896 233.60512l-57.6-57.6-364.8 364.8-134.4-129.60256z"
      p-id="123328"
    ></path>
  ),
  star: (
    <path
      d="M512 736L247.978667 896l70.016-299.989333-232.021334-201.984 306.005334-25.984L512 86.058667l120.021333 281.984 306.005334 25.984-232.021334 201.984L776.021333 896z"
      p-id="123470"
    ></path>
  ),
  category: (
    <path
      d="M128 576h342.016v342.016H128V576z m425.984 169.984q0-80 56.021333-136.021333t136.021334-56.021334 136.021333 56.021334 56.021333 136.021333-56.021333 136.021333-136.021333 56.021334-136.021334-56.021334-56.021333-136.021333zM512 86.016l233.984 384H277.973333z"
      p-id="123612"
    ></path>
  ),
  auto_number: (
    <path
      d="M870.016 405.333333V298.666667h-134.485333l27.818666-213.333334h-106.666666l-27.818667 213.333334h-213.333333l27.818666-213.333334H341.333333l-27.818666 213.333334H128v106.666666h171.605333l-27.818666 213.333334H128V725.333333h134.485333L234.666667 938.666667H341.333333l27.818667-213.333334h213.333333L554.666667 938.666667h106.666666l27.818667-213.333334H874.666667v-106.666666h-171.605334l27.818667-213.333334z m-278.272 213.333334h-213.333333l27.818666-213.333334h213.333334z"
      p-id="123754"
    ></path>
  ),
  rich_text: (
    <path
      d="M85.333333 843.861333v-94.805333h853.333334v94.805333z m0-189.610666L274.944 170.666667h99.584l184.874667 478.805333h-109.013334l-33.194666-90.069333H227.541333l-33.194666 94.805333z m175.402667-175.445334h132.736L327.125333 303.402667z m336.597333 170.666667V554.666667h336.597334v94.805333z m0-189.610667V365.056h336.597334v94.805333z m0-194.389333V170.666667h336.597334v94.805333z"
      p-id="123896"
    ></path>
  ),
  id_number: (
    <path
      d="M853.333333 853.333333H170.666667a85.333333 85.333333 0 0 1-85.333334-85.333333V256a85.333333 85.333333 0 0 1 85.333334-85.333333h682.666666a85.333333 85.333333 0 0 1 85.333334 85.333333v512a85.333333 85.333333 0 0 1-85.333334 85.333333z m-256-213.333333v42.666667h256v-42.666667h-256z m-261.205333-68.821333c-57.728 0-165.461333 28.416-165.461333 82.730666v27.562667h330.965333v-27.562667c0-54.314667-107.733333-82.730667-165.504-82.730666zM597.333333 512v42.666667h256v-42.666667h-256zM336.128 341.333333a82.816 82.816 0 0 0-82.730667 82.773334 82.816 82.816 0 0 0 82.730667 82.730666A82.816 82.816 0 0 0 418.858667 424.106667 82.858667 82.858667 0 0 0 336.128 341.333333zM597.333333 384v42.666667h256V384h-256z"
      p-id="124038"
    ></path>
  ),
  location_on: (
    <path
      d="M512 489.984q43.989333 0 75.008-31.018667t31.018667-75.008-31.018667-75.008T512 277.930667t-75.008 31.018666-31.018667 75.008 31.018667 75.008 75.008 31.018667z m0-403.968q123.989333 0 210.986667 86.997333T809.984 384q0 61.994667-31.018667 141.994667t-75.008 150.016-86.997333 130.986666-73.002667 96.981334l-32 34.005333q-11.989333-13.994667-32-36.992t-72.021333-91.989333-91.008-134.016-70.997333-146.986667T213.930667 384q0-123.989333 86.997333-210.986667t210.986667-86.997333z"
      p-id="124180"
    ></path>
  ),
  gesture: (
    <path
      d="M195.84 293.973333c29.866667-30.293333 59.733333-57.6 72.96-52.053333 21.333333 8.533333 0 43.946667-12.8 64.853333-10.666667 17.92-122.026667 165.973333-122.026667 269.226667a153.045333 153.045333 0 0 0 57.173334 127.146667 128 128 0 0 0 112.64 19.626666c45.653333-13.226667 83.2-59.733333 130.56-118.186666 51.626667-63.573333 120.746667-146.773333 174.08-146.773334 69.546667 0 70.4 43.093333 75.093333 76.373334a260.736 260.736 0 0 0-229.546667 229.12 134.741333 134.741333 0 0 0 136.96 131.84c69.546667 0 183.04-56.746667 200.106667-260.266667H896v-106.666667h-105.386667c-6.4-70.4-46.506667-179.2-171.946666-179.2-96 0-178.346667 81.493333-210.773334 121.173334-24.746667 31.146667-87.893333 105.813333-97.706666 116.053333-10.666667 12.8-29.013333 35.84-47.36 35.84-19.2 0-30.72-35.413333-15.36-81.92a778.581333 778.581333 0 0 1 78.933333-150.186667 226.133333 226.133333 0 0 0 55.466667-139.946666A112.426667 112.426667 0 0 0 274.773333 128a186.069333 186.069333 0 0 0-116.053333 53.333333c-15.36 15.36-28.16 28.16-37.546667 39.68z m396.373333 497.493334a32.042667 32.042667 0 0 1-31.573333-30.72 151.04 151.04 0 0 1 122.453333-117.76c-12.8 114.773333-61.013333 148.48-90.88 148.48z"
      p-id="124322"
    ></path>
  ),
  a_barcode: (
    <path
      d="M725.333333 213.333333h85.333334v597.333334h-85.333334zM853.333333 213.333333h42.666667v597.333334h-42.666667zM426.666667 213.333333h85.333333v597.333334h-85.333333zM128 213.333333h42.666667v597.333334H128zM554.666667 213.333333h128v597.333334h-128zM213.333333 213.333333h170.666667v597.333334H213.333333z"
      p-id="124464"
    ></path>
  ),
  amount_capital: (
    <React.Fragment>
      <path
        d="M550.058667 684.629333h93.482666c5.461333-52.693333 10.325333-110.933333 13.568-157.568h-81.493333c-8.704 57.770667-16.853333 112.64-25.557333 157.568z"
        p-id="124606"
      ></path>
      <path
        d="M810.666667 128H213.333333a85.333333 85.333333 0 0 0-85.333333 85.333333v597.333334a85.333333 85.333333 0 0 0 85.333333 85.333333h597.333334a85.333333 85.333333 0 0 0 85.333333-85.333333V213.333333a85.333333 85.333333 0 0 0-85.333333-85.333333zM391.424 765.226667H328.917333v-282.581334c-13.610667 17.408-27.178667 34.133333-41.301333 49.450667a455.466667 455.466667 0 0 0-33.194667-67.882667 585.386667 585.386667 0 0 0 125.013334-205.44l59.733333 18.474667a800.554667 800.554667 0 0 1-47.786667 105.984z m378.197333-20.096H415.829333v-60.501334h67.925334c9.258667-45.610667 17.962667-100.522667 26.666666-157.568h-68.522666v-60.032h77.184c5.461333-36.949333 10.325333-74.965333 14.122666-109.738666h-94.549333V296.832h312.490667v60.330667h-151.594667c-4.266667 35.285333-9.258667 72.789333-14.677333 109.738666h82.048l10.325333-2.176 48.896 3.285334c-3.285333 64.64-10.325333 144.512-17.408 216.789333h60.885333z"
        p-id="124607"
      ></path>
    </React.Fragment>
  ),
  link_record: (
    <React.Fragment>
      <path
        d="M170.666667 298.666667h426.666666v256h-128v85.333333h213.333334V298.666667a85.333333 85.333333 0 0 0-85.333334-85.333334H170.666667a85.333333 85.333333 0 0 0-85.333334 85.333334v341.333333h213.333334v-85.333333H170.666667z"
        p-id="124749"
      ></path>
      <path
        d="M725.333333 384v85.333333h128v256H426.666667v-256h128V384H341.333333v341.333333a85.333333 85.333333 0 0 0 85.333334 85.333334h426.666666a85.333333 85.333333 0 0 0 85.333334-85.333334V384z"
        p-id="124750"
      ></path>
    </React.Fragment>
  ),
  Worksheet_query: (
    <React.Fragment>
      <path
        d="M868.565333 811.349333a162.602667 162.602667 0 0 0 24.021334-85.034666 168.362667 168.362667 0 1 0-168.405334 168.362666 166.4 166.4 0 0 0 84.992-23.978666l108.16 108.16 59.306667-59.349334z m-144.384-0.853333a84.181333 84.181333 0 1 1 84.224-84.181333 84.437333 84.437333 0 0 1-84.224 84.181333z"
        p-id="124892"
      ></path>
      <path
        d="M212.650667 212.693333h554.24v301.098667h84.650666V208.426667A80.384 80.384 0 0 0 771.157333 128H208.384A80.384 80.384 0 0 0 128 208.426667v562.730666a80.384 80.384 0 0 0 80.384 80.426667h305.408v-84.693333H212.650667z"
        p-id="124893"
      ></path>
      <path d="M298.666667 337.792h384.896V425.813333H298.666667z" p-id="124894"></path>
      <path d="M298.666667 551.125333h213.333333v88.021334H298.666667z" p-id="124895"></path>
    </React.Fragment>
  ),
  table: (
    <path
      d="M864.66666667 198.51851883H159.33333333c-43.1037034 0-78.37037007 35.26666667-78.37037006 78.37037006v470.22222222c0 43.1037034 35.26666667 78.37037007 78.37037006 78.37037006h705.33333334c43.1037034 0 78.37037007-35.26666667 78.37037006-78.37037006V276.88888889c0-43.1037034-35.26666667-78.37037007-78.37037006-78.37037006zM335.66666667 747.11111111h-156.74074106v-156.74074104h156.74074106v156.74074104z m0-235.11111111h-156.74074106V355.25925895h156.74074106v156.74074105z m254.7037034 235.11111111h-156.74074014v-156.74074104h156.74074014v156.74074104z m0-235.11111111h-156.74074014V355.25925895h156.74074014v156.74074105z m254.70370432 176.33333333V747.11111111h-156.74074106v-156.74074104h156.74074105v97.96296326z m-1e-8-235.1111111V512h-156.74074105V355.25925895h156.74074105v97.96296328z"
      p-id="125037"
    ></path>
  ),
  lookup: (
    <path
      d="M811.52 743.68A168.746667 168.746667 0 0 1 725.333333 768a170.666667 170.666667 0 0 1-170.666666-170.666667 170.666667 170.666667 0 0 1 170.666666-170.666666 170.666667 170.666667 0 0 1 170.666667 170.666666 164.778667 164.778667 0 0 1-24.32 86.186667l109.610667 109.653333L921.173333 853.333333zM640 597.333333a85.589333 85.589333 0 0 0 85.333333 85.333334 85.589333 85.589333 0 0 0 85.333334-85.333334 85.589333 85.589333 0 0 0-85.333334-85.333333 85.589333 85.589333 0 0 0-85.333333 85.333333zM85.333333 725.333333v-85.333333h341.333334v85.333333z m0-213.333333v-85.333333h341.333334v85.333333z m0-213.333333V213.333333h768v85.333334z"
      p-id="125179"
    ></path>
  ),
  sigma: (
    <path
      d="M768 170.666667H256v85.333333l277.333333 256L256 768v85.333333h512v-128h-298.666667l213.333334-213.333333-213.333334-213.333333h298.666667z"
      p-id="125321"
    ></path>
  ),
  device_hub: (
    <path
      d="M725.333333 682.666667l-170.666666-170.666667V376.32a128 128 0 1 0-85.333334 0V512l-170.666666 170.666667H128v213.333333h213.333333v-130.133333l170.666667-179.2 170.666667 179.2V896h213.333333v-213.333333z"
      p-id="125463"
    ></path>
  ),
  cascade_selection: (
    <path
      d="M896 128H128a42.666667 42.666667 0 0 0-42.666667 42.666667v213.333333a42.666667 42.666667 0 0 0 42.666667 42.666667h42.666667v256a85.333333 85.333333 0 0 0 85.333333 85.333333h170.666667v42.666667a85.333333 85.333333 0 0 0 85.333333 85.333333h341.333333a85.333333 85.333333 0 0 0 85.333334-85.333333v-170.666667a85.333333 85.333333 0 0 0-85.333334-85.333333h-341.333333a85.333333 85.333333 0 0 0-85.333333 85.333333v42.666667H256v-256h640a42.666667 42.666667 0 0 0 42.666667-42.666667V170.666667a42.666667 42.666667 0 0 0-42.666667-42.666667z m-384 512h341.333333v170.666667h-341.333333z"
      p-id="125605"
    ></path>
  ),
};