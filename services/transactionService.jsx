export const createOrUpdateTransaction = async(
    transactionData: Partial<TransactionType>
) => {
    try {
        const {id, type, walletId, amount, image} = transactionData
        if(!amount || amount<=0 || !walletId)
        return { success: true }
    } catch (err){
        console.log("error creating or updating transaction");
        return {success:false, msg: err.message}
    }
}