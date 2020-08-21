/**
 * Rave Web View for React Native
 * Author: Martins Joseph (creativeJoe007)
 * Website: https://creativejoe007.com
 */
import React, {useState, createRef} from 'react';
import {Modal, Text, View, TouchableOpacity, ActivityIndicator} from 'react-native';
import { WebView } from 'react-native-webview';

let showModal;
let setShowModal;
let isLoading;
let setIsLoading;

export const RaveWebView = props => {
  [showModal, setShowModal] = useState(props.active || false);
  [isLoading, setIsLoading] = useState(false);
  let webView = createRef();

  let Rave = {
      html:  `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body onload="payWithRave()" style="background-color:#fff;height:100vh ">
            <form>
              <script src="https://api.ravepay.co/flwv3-pug/getpaidx/api/flwpbf-inline.js"></script>
            </form>

            <script>
              const API_publicKey = "${props.raveKey}";
              window.onload = payWithRave;
              function payWithRave() {
                var x = getpaidSetup({
                  PBFPubKey: API_publicKey,
                  amount: ${props.amount},
                  customer_phone: "${props.customerPhone || ''}",
                  customer_email: "${props.customerEmail || ''}",
                  custom_description: "${props.contentDescription}",
                  currency: "${props.currency || 'NGN'}",
                  txref: "${props.txref}",
                  meta: [{
                      metaname: "${props.billingName || props.customerEmail || ''}",
                      metavalue: "${props.billingMobile || props.customerPhone || ''}"
                  }],
                  onclose: function() {
                    var resp = {event:'cancelled'};
                    window.ReactNativeWebView.postMessage(JSON.stringify(resp))
                  },
                  callback: function(response) {
                      var txref = response.tx.txRef;
                        if (
                          response.tx.chargeResponseCode == "00" ||
                          response.tx.chargeResponseCode == "0"
                      ) {
                            var resp = {event:'successful', transactionRef:txref};
                            window.ReactNativeWebView.postMessage(JSON.stringify(resp))
                      } else {
                        var resp = {event:'error'};
                        window.ReactNativeWebView.postMessage(JSON.stringify(resp))
                      }
                      x.close();
                  }
                });
              }
            </script>
          </body>
        </html>
      `
    }

    return (
      <View>
        <Modal
          visible={showModal}
          style={{backgroundColor: 'red'}}
          animationType="slide"
          transparent={false}>
            <WebView
                javaScriptEnabled={true}
                javaScriptEnabledAndroid={true}
                originWhitelist={['*']}
                ref={webView}
                source={Rave}
                onMessage={(e)=> messageRecived(props, e.nativeEvent.data)}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
              />
            {/*Start of Loading modal*/}
            {
              isLoading === true && (
                <View style={{position: 'absolute', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', top: 0}}>
                  <ActivityIndicator size="large" color={props.ActivityIndicatorColor || '#f5a623'} />
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      backgroundColor: '#f5a623',
                      borderRadius: 4,
                      padding: 10,
                      paddingTop: 7,
                      paddingBottom: 7
                    }}
                    onPress={() => {
                      setIsLoading(false)
                      props.onCancel();
                    }}>
                    <Text style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )
            }
        </Modal>
        {
          typeof props.active == "undefined" && (
           <TouchableOpacity style={props.btnStyles} onPress={() => setShowModal(true)}>
             <Text style={props.textStyles}>{props.buttonText}</Text>
           </TouchableOpacity>
          )
        }
      </View>
    );
}

const messageRecived = async (props, data) => {
  var webResponse = JSON.parse(data);
  switch(webResponse.event){
    case 'cancelled':
      props.onCancel();
    break;
    case 'successful':
      props.onSuccess(webResponse);
      break;
    default:
      props.onError();
    break;
  }
}
