const axios = require('axios');

module.exports = (srv) => {

    const { SchedulingAgreements, ASNList, ASNListHeader } = srv.entities;

    srv.on('READ', SchedulingAgreements, async (req) => {
        const { AddressCode, UnitCode } = req._queryOptions
        const schNum = req._queryOptions.SchNum || "";
        // const AddressCode = 'JSE-01-01';
        // const UnitCode = 'P01';

        const results = await getSchedulingAgreements(AddressCode, UnitCode, schNum, ASNList, ASNListHeader);
        if (results.error) req.reject(500, results.error);

        const expandDocumentRows = req.query.SELECT.columns && req.query.SELECT.columns.some(({ expand, ref }) => expand && ref[0] === "DocumentRows");
        if (expandDocumentRows) {
            results.schedulingAgreements.forEach(po => {
                po.DocumentRows = results.documentRows.filter(dr => dr.SchNum_ScheduleNum === po.ScheduleNum);
            });
        }

        // Checking for search parameter
        const searchVal = req._queryOptions && req._queryOptions.$search;
        if (searchVal) {
            const cleanedSearchVal = searchVal.trim().replace(/"/g, '');
            results.schedulingAgreements = results.schedulingAgreements.filter(sa =>
                sa.ScheduleNum.includes(cleanedSearchVal)
            );
        }

        return results.schedulingAgreements;
    });

    srv.on('getSchedulingAgreementMaterialQuantityList', async (req) => {
        const { UnitCode, PoNum, MaterialCode, PoLineNum } = req.data;
        // Replace '-' with '/' for PoNum
        const formattedPoNum = PoNum.replace(/-/g, '/');
        return getSchedulingAgreementMaterialQuantityList(UnitCode, formattedPoNum, MaterialCode, PoLineNum)
    });

    srv.on('PostASN', async (req) => {
        const asnDataString = req.data.asnData;
        const asnDataParsed = JSON.parse(asnDataString);
        const asnDataFormatted = JSON.stringify(asnDataParsed, null, 2);
        try {
            const response = await postASN(asnDataFormatted);
            return response;
        } catch (error) {
            console.error('Error in PostASN API call:', error);
            req.reject(400, `Error posting ASN: ${error.message}`);
        }
    });

};

async function getSchedulingAgreements(AddressCode, UnitCode, schNum, ASNList, ASNListHeader) {
    try {
        const response = await axios({
            method: 'get',
            url: `https://imperialauto.co:84/IAIAPI.asmx/GetSchedulingAgreementMaterialList?AddressCode='${AddressCode}'&UnitCode='${UnitCode}'&RequestBy='Manikandan'`,
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: {}
        });

        if (response.data && response.data.d) {
            const dataArray = JSON.parse(response.data.d);

            let record = [];
            if (schNum) {
                record = await SELECT.from(ASNListHeader).where({ SCHNUM_SCHEDULENUM: schNum }).orderBy('createdAt desc');
            }

            const schedulingAgreements = dataArray.map(data => {
                return {
                    ScheduleNum: data.SchNum,
                    SchLineNum: data.SchLineNum,
                    PoNum: data.PoNum,
                    SchDate: data.SchDate,
                    ValidFrom: data.ValidFrom,
                    ValidTo: data.ValidTo,
                    VendorCode: data.VendorCode,
                    VendorName: data.VendorName,
                    PlantCode: data.PlantCode,
                    PlantName: data.PlantName,
                    TotalInvNetAmnt: record.length > 0 ? record[0].TotalInvNetAmnt : "",
                    TotalGstAmnt: record.length > 0 ? record[0].TotalGstAmnt : ""
                };
            });

            let itemRecord = [], filter, supplierRate = true, rateAggreed = "";
            if (schNum) {
                itemRecord = await SELECT.from(ASNList).where({ SCHNUM_SCHEDULENUM: schNum }).orderBy('createdAt desc');
            }

            // Extracting DocumentRows details
            const documentRows = dataArray.flatMap(data =>
                data.DocumentRows.map(row => {

                    if (schNum) {
                        filter = itemRecord.filter(item => item.ItemCode === row.ItemCode);
                        rateAggreed = filter[0]?.RateAggreed;
                        rateAggreed = rateAggreed === undefined ? true : rateAggreed;
                        supplierRate = filter[0]?.SupplierRate;
                        supplierRate = supplierRate === undefined ? '' : supplierRate;
                    }

                    return {
                        SchLineNum: row.LineNum,
                        PoNum: row.PoNum,
                        SchDate: data.SchDate,
                        VendorName: data.VendorName,
                        VendorCode: data.VendorCode,
                        PlantCode: data.PlantCode,
                        PlantName: data.PlantName,
                        LineNum: parseInt(row.BillLineNumber),
                        ItemCode: row.ItemCode,
                        ItemDesc: row.ItemDesc,
                        HSNCode: row.HSNCode,
                        ASNQty: parseInt(row.ASNQty),
                        PoQty: parseInt(row.PoQty),
                        DeliveredQty: parseFloat(row.DeliveredQty),
                        BalanceQty: parseFloat(row.BalanceQty),
                        UnitPrice: parseFloat(row.UnitPrice),
                        UOM: row.UOM,
                        Currency: row.Currency,
                        Status: row.Status,
                        ConfirmStatus: "",
                        ASSValue: row.ASSValue,
                        Packing: row.Packing,
                        OtherCharges: row.OtherCharges,
                        Frieght: row.Frieght,
                        TCS: row.TCS,
                        SGST: row.SGST,
                        SGA: row.SGA,
                        CGST: row.CGST,
                        CGA: row.CGA,
                        IGST: row.IGST,
                        IGA: row.IGA,
                        TOTAL: row.TOTAL,
                        TCA: row.TCA,
                        LineValue: row.LineValue,
                        WeightInKG: row.WeightInKG,
                        RateAggreed: rateAggreed,
                        SupplierRate: supplierRate,
                        SchNum_ScheduleNum: data.SchNum  // associating with the current Scheduling Agreement
                    };
                })
            );

            return {
                schedulingAgreements: schedulingAgreements,
                documentRows: documentRows
            };
        } else {
            return {
                error: response.data.ErrorDescription
            }
        }
    } catch (error) {
        req.reject(500, error);
        console.error('Error in API call:', error);
        throw error;
    }
}

async function getSchedulingAgreementMaterialQuantityList(UnitCode, PoNum, MaterialCode, PoLineNum) {
    try {
        const response = await axios({
            method: 'get',
            url: `https://imperialauto.co:84/IAIAPI.asmx/GetSchedulingAgreementMaterialQuantityList?UnitCode='${UnitCode}'&PoNum='${PoNum}'&MaterialCode='${MaterialCode}'&PoLineNum='${PoLineNum}'&RequestBy='Manikandan'`,
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: {}
        });

        if (response.data && response.data.d) {
            return JSON.parse(response.data.d);
        } else {
            console.error('Error parsing response:', response.data);
            throw new Error('Error parsing the response from the API.');
        }
    } catch (error) {
        console.error('Error in getPurchaseMaterialQuantityList API call:', error);
        throw new Error('Unable to fetch Purchase Material Quantity List.');
    }
}

async function postASN(asnData) {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://imperialauto.co:84/IAIAPI.asmx/PostASN',
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: asnData
        });

        if (response.data && response.data.SuccessCode) {
            return response.data.SuccessCode.replace(/,/g, '');
        } else {
            throw new Error(response.data.ErrorDescription || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error in postASN:', error);
        throw error;
    }
}
