namespace my.bookshop;

entity SchedulingAgreements{
  key ScheduleNum:String;
      SchLineNum: String;
      PoNum:      String;
      SchDate:    String;
      ValidFrom:  String;
      ValidTo:    String;
      VendorCode: String;
      VendorName: String;
      PlantCode:  String;
      PlantName:  String;
      DocumentRows : Composition of many DocumentRowItems
                       on DocumentRows.SchNum = $self;
      asnList       : Composition of many ASNList
                        on asnList.SchNum = $self;
      asnListHeader : Composition of many ASNList
                        on asnListHeader.SchNum = $self;
}

entity DocumentRowItems {
  key UUID         : UUID;
      SchDate      : Date;
      VendorName   : String;
      VendorCode   : String;
      PlantCode    : String;
      PlantName    : String;
      LineNum      : String;
      ItemCode     : String;
      ItemDesc     : String;
      HSNCode      : String;
      PoQty        : Integer;
      DeliveredQty : Decimal;
      BalanceQty   : Decimal;
      UnitPrice    : Decimal;
      UOM          : String;
      Currency     : String;
      Status       : String;
      ConfirmStatus  : String;
      ASSValue       : String;
      Packing        : String;
      Frieght        : String;
      TCS            : String;
      SGST           : String;
      SGA            : String;
      CGST           : String;
      CGA            : String;
      IGST           : String;
      IGA            : String;
      TOTAL          : String;
      TCA            : String;
      LineValue      : String;
      WeightInKG     : String;
      SchNum         : Association to SchedulingAgreements;
}

entity ASNList {
  key UUID                    : UUID;
      SchNum                  : Association to SchedulingAgreements;
      ItemCode                : String;
      BillLineNumber          : String;
      ScheduleNumber          : String;
      ScheduleLineNumber      : String;
      TemRevNo                : String;
      ItemUOM                 : String;
      HsnCode                 : String;
      AddressCode             : String;
      ItemRate                : String;
      BalanceQty              : String;
      ASSValue                : String;
      PFA                     : String;
      FFC                     : String;
      OT1                     : String;
      IGP                     : String;
      IGA                     : String;
      CGP                     : String;
      CGA                     : String;
      SGP                     : String;
      SGA                     : String;
      UGP                     : String;
      UGA                     : String;
      Packaging               : String;
      WeightPerKG             : String;
      LineValue               : String;
      TCS                     : String;
      TCA                     : String;
}

entity ASNListHeader {
  key SchNum                  : Association to SchedulingAgreements;
      AsnNum                  : String;
      BillNumber              : String;
      BillDate                : String;
      DocketNumber            : String;
      GRDate                  : String;
      TransportName           : String;
      TransportMode           : String;
      EwayBillNumber          : String;
      EwayBillDate            : String;
      MillNumber              : String;
      MillName                : String;
      PDIRNumber              : String;
      HeatNumber              : String;
      BatchNumber             : String;
      ManufacturingMonth      : String;
}