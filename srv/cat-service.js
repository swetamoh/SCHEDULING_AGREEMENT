const cds = require('@sap/cds');
const axios = require('axios');

module.exports = (srv) => {

    const {SchedulingAgreements} = srv.entities;
    
    srv.on('READ', SchedulingAgreements, async (req) => {
        const {unitCode} = req._queryOptions
        const results = await getSchedulingAgreements(unitCode);
        if (!results) throw new Error('Unable to fetch Scheduling Agreements.');

        const expandDocumentRows = req.query.SELECT.columns && req.query.SELECT.columns.some(({ expand, ref }) => expand && ref[0] === "DocumentRows");
        if (expandDocumentRows) {
            results.schedulingAgreements.forEach(po => {
                po.DocumentRows = results.documentRows.filter(dr => dr.PNum_SchNum === po.SchNum);
            });
        }

        // Checking for search parameter
        const searchVal = req._queryOptions && req._queryOptions.$search;
        if (searchVal) {
            const cleanedSearchVal = searchVal.trim().replace(/"/g, '');
            results.schedulingAgreements = results.schedulingAgreements.filter(sa =>
                sa.SchNum.includes(cleanedSearchVal)
            );
        }
    
       return results.schedulingAgreements;
    });

};

async function getSchedulingAgreements(unitCode) {
    try {
        const response = await axios({
            method: 'get',
            url: `https://imperialauto.co:84/IAIAPI.asmx/GetSchedulingAgreementMaterialList?UnitCode='${unitCode}'&RequestBy='Manikandan'`,
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: {}
        });

        if (response.data && response.data.d) {
            const dataArray = JSON.parse(response.data.d);

            const schedulingAgreements = dataArray.map(data => {
                return {
                    SchNum: data.SchNum,
                    SchDate: data.SchDate,
                    VendorCode: data.VendorCode,
                    VendorName: data.VendorName,
                    PlantCode: data.PlantCode,
                    PlantName: data.PlantName,
                    DocStatus: data.DocStatus
                };
            });

            // Extracting DocumentRows details
            const documentRows = dataArray.flatMap(data =>
                data.DocumentRows.map(row => {
                    return {
                        LineNum: parseInt(row.LineNum),
                        PoDate: data.PoDate,
                        VendorName: data.VendorName,
                        VendorCode: data.VendorCode,
                        PlantCode: data.PlantCode,
                        PlantName: data.PlantName,
                        ItemCode: row.ItemCode,
                        ItemDesc: row.ItemDesc,
                        HSNCode: row.HSNCode,
                        PoQty: parseInt(row.PoQty),
                        DeliveredQty: parseFloat(row.DeliveredQty),
                        BalanceQty: parseFloat(row.BalanceQty),
                        UnitPrice: parseFloat(row.UnitPrice),
                        PNum_SchNum: data.SchNum  // associating with the current Scheduling Agreement
                    };
                })
            );

            return {
                schedulingAgreements: schedulingAgreements,
                documentRows: documentRows
            };
        }
    } catch (error) {
        console.error('Error in API call:', error);
        throw error;
    }
}