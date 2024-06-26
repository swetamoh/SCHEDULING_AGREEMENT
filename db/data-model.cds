namespace my.schedulingagreement;

using {managed} from '@sap/cds/common';

entity SchedulingAgreements {
  key ScheduleNum   : String;
      SchLineNum    : String;
      PoNum         : String;
      SchDate       : String;
      ValidFrom     : String;
      ValidTo       : String;
      VendorCode    : String;
      VendorName    : String;
      PlantCode     : String;
      PlantName     : String;
      DocumentRows  : Composition of many DocumentRowItems
                        on DocumentRows.SchNum = $self;
      asnList       : Composition of many ASNList
                        on asnList.SchNum = $self;
      asnListHeader : Composition of many ASNList
                        on asnListHeader.SchNum = $self;
}

entity DocumentRowItems {
  key UUID          : UUID;
      SchLineNum    : String;
      PoNum         : String;
      SchDate       : Date;
      VendorName    : String;
      VendorCode    : String;
      PlantCode     : String;
      PlantName     : String;
      LineNum       : Integer;
      ItemCode      : String;
      ItemDesc      : String;
      HSNCode       : String;
      ASNQty        : Integer;
      PoQty         : Integer;
      DeliveredQty  : Decimal;
      BalanceQty    : Decimal;
      Balance       : Decimal;
      UnitPrice     : Decimal;
      UOM           : String;
      Currency      : String;
      Status        : String;
      ConfirmStatus : String;
      ASSValue      : String;
      OtherCharges  : String;
      Packing       : String;
      Frieght       : String;
      TCS           : String;
      SGST          : String;
      SGA           : String;
      CGST          : String;
      CGA           : String;
      IGST          : String;
      IGA           : String;
      TOTAL         : String;
      TCA           : String;
      LineValue     : String;
      WeightInKG    : String;
      ItemRevNumber : String;
      SchNum        : Association to SchedulingAgreements;
      RateAggreed   : Boolean default true;
      SupplierRate  : Integer;
}

entity ASNList : managed {
  key UUID           : UUID;
      SchNum         : Association to SchedulingAgreements;
      ItemCode       : String;
      ItemDesc       : String;
      BillLineNumber : String;
      SchLineNum     : String;
      PoNum          : String;
      SchDate        : Date;
      LineNum        : Integer;
      UOM            : String;
      HSNCode        : String;
      UnitPrice      : String;
      BalanceQty     : String;
      Balance        : String;
      DeliveredQty   : Decimal;
      ASSValue       : String;
      Packing        : String;
      Frieght        : String;
      OtherCharges   : String;
      IGST           : String;
      IGA            : String;
      CGST           : String;
      CGA            : String;
      SGST           : String;
      SGA            : String;
      UGP            : String;
      UGA            : String;
      Packages       : String;
      WeightInKG     : String;
      LineValue      : String;
      TCS            : String;
      TCA            : String;
      Currency       : String;
      Status         : String;
      ConfirmStatus  : String;
      PlantCode      : String;
      PlantName      : String;
      PoQty          : Integer;
      ASNQty         : Integer;
      VendorCode     : String;
      VendorName     : String;
      TOTAL          : String;
      RateAggreed    : Boolean default true;
      SupplierRate   : Integer;
      MatExpDate     : String;
      Pkg            : String;
      ItemRevNumber  : String;
}

entity ASNListHeader : managed {
  key AsnNum             : String;
      SchNum             : Association to SchedulingAgreements;
      BillNumber         : String;
      BillDate           : String;
      DeliveryNumber     : String;
      DeliveryDate       : String;
      DocketNumber       : String;
      GRDate             : String;
      TransportName      : String;
      TransportMode      : String;
      EwayBillNumber     : String;
      EwayBillDate       : String;
      MillNumber         : String;
      MillName           : String;
      PDIRNumber         : String;
      HeatNumber         : String;
      BatchNumber        : String;
      ManufacturingMonth : String;
      PlantName          : String;
      PlantCode          : String;
      VendorCode         : String;
      TotalInvNetAmnt    : Integer;
      TotalCGstAmnt      : Integer;
      TotalSGstAmnt      : Integer;
      TotalIGstAmnt      : Integer;
      TotalAmnt          : Integer;
      RateStatus         : String;
      TransporterID      : String;
      TotalPkg           : String;
      TotalWeight        : String;
}

entity Files : managed {
  key AsnNum    : String;

      @Core.MediaType                  : mediaType
      content   : LargeBinary;

      @Core.ContentDisposition.Filename: fileName
      @Core.IsMediaType                : true
      mediaType : String;
      fileName  : String;
      size      : Integer;
      url       : String;
}
