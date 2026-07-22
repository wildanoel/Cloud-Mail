
import * as echarts from 'echarts/core';

import { BarChart,PieChart,LineChart,GaugeChart} from 'echarts/charts';
import {
    TooltipComponent,
    GridComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { LegendComponent } from 'echarts/components';
echarts.use([
    GaugeChart,
    LegendComponent,
    PieChart,
    TooltipComponent,
    GridComponent,
    BarChart,
    LineChart,
    CanvasRenderer
]);

export default echarts