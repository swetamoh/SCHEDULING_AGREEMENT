using my.schedulingagreement as my from '../db/data-model';

type AgreementMaterialQuantityInfo {
    RowNum: Integer;
    PONum: String;
    ItemCode: String;
    ItemDesc: String;
    PoQty: Integer;
    DeliveryQty: Integer;
    DeliveryDate: String;
    Status: String;
};

type TransType {
    TransCode: String;
};


service CatalogService {
    entity SchedulingAgreements as projection on my.SchedulingAgreements;
    entity DocumentRowItems as projection on my.DocumentRowItems;

    entity ASNList as projection on my.ASNList;
    entity ASNListHeader as projection on my.ASNListHeader;

    entity Files as projection on my.Files;

    function getSchedulingAgreementMaterialQuantityList(UnitCode:String, PoNum: String, MaterialCode: String, PoLineNum: String) returns array of AgreementMaterialQuantityInfo;
    function GetTransportModeList() returns array of TransType;

    action PostASN(asnData: String) returns String;
}
