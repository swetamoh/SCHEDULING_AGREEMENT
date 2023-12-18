namespace my.bookshop;

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
      LineNum       : String;
      ItemCode      : String;
      ItemDesc      : String;
      HSNCode       : String;
      PoQty         : Integer;
      DeliveredQty  : Decimal;
      BalanceQty    : Decimal;
      UnitPrice     : Decimal;
      UOM           : String;
      Currency      : String;
      Status        : String;
      ConfirmStatus : String;
      ASSValue      : String;
      SchNum        : Association to SchedulingAgreements;
}

entity ASNList {
  key UUID           : UUID;
      SchNum         : Association to SchedulingAgreements;
      ItemCode       : String;
      ItemDesc       : String;
      BillLineNumber : String;
      SchLineNum     : String;
      PoNum          : String;
      SchDate        : Date;
      LineNum        : String;
      UOM            : String;
      HSNCode        : String;
      UnitPrice      : String;
      BalanceQty     : String;
      DeliveredQty   : Decimal;
      ASSValue       : String;
      PFA            : String;
      FFC            : String;
      OT1            : String;
      IGP            : String;
      IGA            : String;
      CGP            : String;
      CGA            : String;
      SGP            : String;
      SGA            : String;
      UGP            : String;
      UGA            : String;
      Packaging      : String;
      WeightPerKG    : String;
      LineValue      : String;
      TCS            : String;
      TCA            : String;
      Currency       : String;
      Status         : String;
      ConfirmStatus  : String;
      PlantCode      : String;
      PlantName      : String;
      PoQty          : Integer;
      VendorCode     : String;
      VendorName     : String;
}

entity ASNListHeader {
  key SchNum             : Association to SchedulingAgreements;
      AsnNum             : String;
      BillNumber         : String;
      BillDate           : String;
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
}
