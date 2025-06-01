export abstract class ConversionConfigurationAware {
    delimiter = " ";
    nodeSectionHeader = "NODE_COORD_SECTION";
    eofSymbol = "EOF";
    dataField = "DATA";
    scale = 0.075;

    constructor(delimiter = " ", nodeSectionHeader = "NODE_COORD_SECTION", eofSymbol = "EOF", dataField = "DATA", scale = 0.075) {
        this.delimiter = delimiter;
        this.nodeSectionHeader = nodeSectionHeader;
        this.eofSymbol = eofSymbol;
        this.dataField = dataField;
        this.scale = scale;
    }
}
