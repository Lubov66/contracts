pragma solidity 0.8.19;

interface IAxelarBridgeAdaptorErrors {
    error ZeroAddresses();
    error InvalidChildChain();
    error NoGas();
    error CallerNotBridge();
}

interface IAxelarBridgeAdaptorEvents {
    event MapTokenAxelarMessage(string indexed childChain, string indexed childBridgeAdaptor, bytes indexed payload);
}
